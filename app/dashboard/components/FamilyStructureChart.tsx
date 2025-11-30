'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,    // Main component for rendering interactive node-based diagrams
  Node,         // Type definition for graph nodes (family members)
  Edge,         // Type definition for connections between nodes (relationships)
  Background,   // Renders a dotted/lined background grid for visual reference
  Controls,     // Provides zoom in/out and fit-to-view buttons
  MiniMap,      // Shows a small overview map for navigation in large diagrams
  useNodesState, // React hook for managing node state with built-in update handlers
  useEdgesState, // React hook for managing edge state with built-in update handlers
  Panel,        // Positions overlay content (e.g., status text) within the flow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css'; // Required base styles for React Flow components
import { FamilyStructureData, FamilyGroup, FamilyMember } from '../data';

interface FamilyStructureChartProps {
  data: FamilyStructureData;
}

/**
 * ROLE_COLORS: Color scheme for visually distinguishing family roles in the network diagram.
 *
 * Design rationale:
 * - Blue tones for Familienoberhaupt (head of family, typically male): Represents authority/primary
 * - Pink tones for Ehefrau (wife): Traditional color association, easy visual distinction
 * - Light blue for Sohn (son): Related to but distinct from Familienoberhaupt
 * - Light pink for Tochter (daughter): Related to but distinct from Ehefrau
 * - Gray for default/unknown roles: Neutral, indicates incomplete data
 *
 * Each role has three color properties:
 * - bg: Background fill color (light shade for readability)
 * - border: Border color (darker shade for definition)
 * - text: Text color (darkest shade for contrast and legibility)
 */
const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Familienoberhaupt': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  'Ehefrau': { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  'Sohn': { bg: '#e0f2fe', border: '#0ea5e9', text: '#0369a1' },
  'Tochter': { bg: '#fdf2f8', border: '#f472b6', text: '#be185d' },
  'default': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
};

/**
 * Returns a gender symbol based on the Geschlecht field value.
 * Used in node labels to provide quick visual gender identification.
 */
const getGenderIcon = (geschlecht: string | null): string => {
  if (geschlecht?.toLowerCase() === 'männlich') return '♂';
  if (geschlecht?.toLowerCase() === 'weiblich') return '♀';
  return '?'; // Unknown or null gender
};

/**
 * Creates a multi-line label for a family member node.
 * Format: "♂/♀ FirstName\nRole\n*BirthYear"
 * The asterisk (*) prefix for birth year follows German genealogical convention.
 */
const createNodeLabel = (member: FamilyMember) => {
  return `${getGenderIcon(member.Geschlecht)} ${member.Vorname || 'Unbekannt'}\n${member.Familienrolle || ''}\n${member.Geburtsjahr ? '*' + member.Geburtsjahr : ''}`;
};

/**
 * createFlowElements: Transforms family data into React Flow nodes and edges.
 *
 * This function implements a grid-based layout algorithm that:
 * 1. Arranges families in a 4-column grid layout
 * 2. Groups family members within a container node
 * 3. Places parents at the top, children below in a 2-column sub-grid
 * 4. Creates edges for parent-child and marriage relationships
 *
 * @param families - Array of family groups with their members
 * @param selectedFamily - If set, only display this family (for filtering)
 * @returns Object containing nodes and edges arrays for React Flow
 */
const createFlowElements = (families: FamilyGroup[], selectedFamily: number | null) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Layout constants for positioning families and members
  const FAMILY_WIDTH = 280;  // Width of each family container
  const FAMILY_GAP = 40;     // Horizontal gap between family containers
  const NODE_HEIGHT = 70;    // Height of individual member nodes
  const NODE_GAP = 15;       // Vertical gap between member rows
  const COLS = 4;            // Number of families per row in the grid

  // Filter families: show only selected family, or first 20 for performance
  // Limiting to 20 families prevents browser slowdown with large datasets
  const displayFamilies = selectedFamily !== null
    ? families.filter(f => f.familiennr === selectedFamily)
    : families.slice(0, 20);

  displayFamilies.forEach((family, familyIndex) => {
    // Calculate grid position: families are arranged left-to-right, top-to-bottom
    const col = familyIndex % COLS;           // Column index (0-3)
    const row = Math.floor(familyIndex / COLS); // Row index
    const familyX = col * (FAMILY_WIDTH + FAMILY_GAP);
    const familyY = row * 400; // 400px vertical spacing between rows

    // Separate family members into parents and children for hierarchical layout
    const parents: FamilyMember[] = [];
    const children: FamilyMember[] = [];

    family.members.forEach(member => {
      const role = member.Familienrolle?.toLowerCase();
      // Familienoberhaupt (head of household) and Ehefrau (wife) are parents
      if (role === 'familienoberhaupt' || role === 'ehefrau') {
        parents.push(member);
      } else {
        // All other roles (Sohn, Tochter, etc.) are children
        children.push(member);
      }
    });

    // Calculate dynamic container height based on number of children
    // Formula accounts for: header, parent row, and children arranged in 2 columns
    const groupHeight = Math.max(200, 80 + (parents.length > 0 ? 80 : 0) + Math.ceil(children.length / 2) * (NODE_HEIGHT + NODE_GAP));

    // Create the family group container node (type: 'group')
    // This acts as a visual boundary and parent for all family member nodes
    nodes.push({
      id: `family-${family.familiennr}`,
      type: 'group',
      position: { x: familyX, y: familyY },
      style: {
        width: FAMILY_WIDTH, height: groupHeight,
        backgroundColor: 'rgba(249, 250, 251, 0.9)', // Semi-transparent gray
        border: '2px solid #e5e7eb', borderRadius: '12px',
      },
      data: { label: '' },
    });

    // Create the family name label node (dark header bar at top of group)
    // Uses parentId to attach to the group, extent: 'parent' constrains movement
    // Display format: "Familie [Name] (#[Order Number]) - [Member Count] Mitglieder"
    const memberCount = family.members.length;
    const memberLabel = memberCount === 1 ? '1 Mitglied' : `${memberCount} Mitglieder`;
    nodes.push({
      id: `family-label-${family.familiennr}`,
      type: 'default',
      position: { x: 10, y: 10 }, // Relative to parent group
      parentId: `family-${family.familiennr}`,
      extent: 'parent', // Cannot be dragged outside parent bounds
      draggable: false, // Label should not be movable
      style: {
        width: FAMILY_WIDTH - 20, background: '#1f2937', color: 'white',
        borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: 600,
        border: 'none', textAlign: 'center',
      },
      data: { label: `#${family.familiennr} ${family.familienname} (${memberLabel})` },
    });

    // Create parent nodes - positioned side by side below the label
    // Index 0 = left (typically Familienoberhaupt), Index 1 = right (typically Ehefrau)
    parents.forEach((member, index) => {
      const colors = ROLE_COLORS[member.Familienrolle || ''] || ROLE_COLORS.default;
      nodes.push({
        id: member.id,
        type: 'default',
        position: { x: 10 + index * 130, y: 55 }, // Horizontal offset of 130px between parents
        parentId: `family-${family.familiennr}`,
        extent: 'parent',
        style: {
          width: 120, background: colors.bg, border: `2px solid ${colors.border}`,
          borderRadius: '8px', padding: '6px', fontSize: '10px', color: colors.text, textAlign: 'center',
        },
        data: { label: createNodeLabel(member) },
      });
    });

    // Create children nodes - arranged in a 2-column grid below parents
    children.forEach((member, index) => {
      const colors = ROLE_COLORS[member.Familienrolle || ''] || ROLE_COLORS.default;
      const c = index % 2;                // Column (0 = left, 1 = right)
      const r = Math.floor(index / 2);    // Row within the children section
      nodes.push({
        id: member.id,
        type: 'default',
        position: { x: 10 + c * 130, y: 140 + r * (NODE_HEIGHT + NODE_GAP) },
        parentId: `family-${family.familiennr}`,
        extent: 'parent',
        style: {
          width: 120, background: colors.bg, border: `2px solid ${colors.border}`,
          borderRadius: '8px', padding: '6px', fontSize: '10px', color: colors.text, textAlign: 'center',
        },
        data: { label: createNodeLabel(member) },
      });

      // Create parent-to-child edge (gray line connecting parent to each child)
      // Only connects to first parent to avoid visual clutter
      if (parents.length > 0) {
        edges.push({
          id: `e-${parents[0].id}-${member.id}`,
          source: parents[0].id, target: member.id,
          style: { stroke: '#9ca3af', strokeWidth: 1 }, // Gray, thin line
          type: 'smoothstep', // Curved edge that routes around obstacles
        });
      }
    });

    // Create marriage edge between parents (pink horizontal line)
    // Only created when exactly 2 parents exist (typical family structure)
    if (parents.length === 2) {
      edges.push({
        id: `marriage-${family.familiennr}`,
        source: parents[0].id, target: parents[1].id,
        style: { stroke: '#ec4899', strokeWidth: 2 }, // Pink, thicker line for emphasis
        type: 'straight', // Direct line between spouses
      });
    }
  });

  return { nodes, edges };
};

/**
 * FamilyStructureChart: Main component for rendering the interactive family network diagram.
 *
 * Features:
 * - Interactive pan and zoom navigation
 * - Family filtering via dropdown selector
 * - Color-coded nodes by family role
 * - Visual relationships (marriage and parent-child edges)
 * - MiniMap for navigation in large diagrams
 * - Summary statistics footer
 */
export default function FamilyStructureChart({ data }: FamilyStructureChartProps) {
  // State for the currently selected family filter (null = show all, up to 20)
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);

  // Memoize initial flow elements to avoid recalculating on every render
  // Only recalculates when families data or selection changes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createFlowElements(data.families, selectedFamily),
    [data.families, selectedFamily]
  );

  // useNodesState and useEdgesState are React Flow hooks that provide:
  // - State management for nodes/edges arrays
  // - Built-in handlers for user interactions (dragging, selecting, etc.)
  // - Optimized re-rendering for large diagrams
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Effect to update the diagram when family selection changes
  // This is necessary because useNodesState/useEdgesState maintain internal state
  // that needs to be explicitly updated when our filter criteria changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createFlowElements(data.families, selectedFamily);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedFamily, data.families, setNodes, setEdges]);

  // Build dropdown options list from family data
  // Memoized to prevent recalculating on every render
  // Display format: "#[Order Number] [Family Name] ([Member Count] Mitglieder)"
  const familyOptions = useMemo(() =>
    data.families.map(f => {
      const memberCount = f.members?.length ?? 0;
      const memberLabel = memberCount === 1 ? '1 Mitglied' : `${memberCount} Mitglieder`;
      return {
        value: f.familiennr,
        label: `#${f.familiennr} ${f.familienname} (${memberLabel})`
      };
    }),
    [data.families]
  );

  // Empty state: show placeholder when no family data is available
  if (data.families.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Familienstruktur</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Keine Familiendaten verfügbar
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Familienstruktur</h3>
            <p className="text-sm text-gray-500 mt-1">
              Interaktives Netzwerkdiagramm der Familienverbindungen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="family-select" className="text-sm text-gray-600">
              Familie:
            </label>
            <select
              id="family-select"
              value={selectedFamily ?? ''}
              onChange={(e) => setSelectedFamily(e.target.value ? Number(e.target.value) : null)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle anzeigen (max. 20)</option>
              {familyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ROLE_COLORS.Familienoberhaupt.bg, border: `2px solid ${ROLE_COLORS.Familienoberhaupt.border}` }} />
          <span>Familienoberhaupt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ROLE_COLORS.Ehefrau.bg, border: `2px solid ${ROLE_COLORS.Ehefrau.border}` }} />
          <span>Ehefrau</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ROLE_COLORS.Sohn.bg, border: `2px solid ${ROLE_COLORS.Sohn.border}` }} />
          <span>Sohn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ROLE_COLORS.Tochter.bg, border: `2px solid ${ROLE_COLORS.Tochter.border}` }} />
          <span>Tochter</span>
        </div>
      </div>

      {/* React Flow Container - fixed height for consistent layout */}
      <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}  // Handles node drag, select, remove events
          onEdgesChange={onEdgesChange}  // Handles edge updates (not used currently but required)
          fitView                        // Auto-fit all nodes in view on initial render
          fitViewOptions={{ padding: 0.2 }} // Add 20% padding around fitted content
          minZoom={0.1}                  // Allow zooming out to see many families
          maxZoom={2}                    // Limit zoom in to prevent pixelation
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }} // Initial view position and zoom
        >
          {/* Background: Renders a subtle grid pattern for visual reference during panning */}
          <Background color="#e5e7eb" gap={20} />

          {/* Controls: Zoom in/out buttons and fit-to-view button, positioned bottom-right */}
          <Controls position="bottom-right" />

          {/* MiniMap: Small overview for navigation in large diagrams
              nodeColor callback determines how each node appears in the minimap:
              - Dark gray for family labels (header bars)
              - Light gray for family group containers
              - Blue for actual person nodes */}
          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith('family-label')) return '#1f2937';
              if (node.id.startsWith('family-')) return '#f3f4f6';
              return '#3b82f6';
            }}
            maskColor="rgba(255, 255, 255, 0.8)" // Semi-transparent overlay outside viewport
          />

          {/* Panel: Overlay showing current view status (family count and total persons) */}
          <Panel position="top-left" className="bg-white/90 rounded-md px-3 py-2 shadow-sm text-xs text-gray-600">
            {selectedFamily
              ? `Familie #${selectedFamily}`
              : `${Math.min(data.totalFamilies, 20)} von ${data.totalFamilies} Familien`
            } | {data.totalMembers} Personen gesamt
          </Panel>
        </ReactFlow>
      </div>

      {/* Summary Statistics Footer
          Provides key metrics at a glance:
          - Familien: Total number of family groups in the dataset
          - Personen: Total number of individual persons across all families
          - Ø Familiengröße: Average family size (totalMembers / totalFamilies)
          - Größte Familie: Size of the largest family (max of all family member counts)

          These calculations are done client-side as they're simple aggregations.
          The spread operator with Math.max handles edge cases like empty arrays. */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Familien</p>
            <p className="text-lg font-semibold text-gray-900">{data.totalFamilies}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Personen</p>
            <p className="text-lg font-semibold text-gray-900">{data.totalMembers}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ø Familiengröße</p>
            <p className="text-lg font-semibold text-gray-900">
              {/* Calculate average: guard against division by zero */}
              {data.totalFamilies > 0 ? (data.totalMembers / data.totalFamilies).toFixed(1) : 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Größte Familie</p>
            <p className="text-lg font-semibold text-gray-900">
              {/* Find max family size; fallback to 0 if no families exist */}
              {Math.max(...data.families.map(f => f.members.length), 0)} Mitglieder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
