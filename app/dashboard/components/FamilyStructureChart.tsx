'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyStructureData, FamilyGroup, FamilyMember } from '../data';

interface FamilyStructureChartProps {
  data: FamilyStructureData;
}

// Color scheme for family roles
const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Familienoberhaupt': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  'Ehefrau': { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  'Sohn': { bg: '#e0f2fe', border: '#0ea5e9', text: '#0369a1' },
  'Tochter': { bg: '#fdf2f8', border: '#f472b6', text: '#be185d' },
  'default': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
};

// Gender icons
const getGenderIcon = (geschlecht: string | null): string => {
  if (geschlecht?.toLowerCase() === 'männlich') return '♂';
  if (geschlecht?.toLowerCase() === 'weiblich') return '♀';
  return '?';
};

// Create node label
const createNodeLabel = (member: FamilyMember) => {
  return `${getGenderIcon(member.Geschlecht)} ${member.Vorname || 'Unbekannt'}\n${member.Familienrolle || ''}\n${member.Geburtsjahr ? '*' + member.Geburtsjahr : ''}`;
};

// Create nodes and edges from family data
const createFlowElements = (families: FamilyGroup[], selectedFamily: number | null) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const FAMILY_WIDTH = 280;
  const FAMILY_GAP = 40;
  const NODE_HEIGHT = 70;
  const NODE_GAP = 15;
  const COLS = 4;

  const displayFamilies = selectedFamily !== null
    ? families.filter(f => f.familiennr === selectedFamily)
    : families.slice(0, 20);

  displayFamilies.forEach((family, familyIndex) => {
    const col = familyIndex % COLS;
    const row = Math.floor(familyIndex / COLS);
    const familyX = col * (FAMILY_WIDTH + FAMILY_GAP);
    const familyY = row * 400;

    const parents: FamilyMember[] = [];
    const children: FamilyMember[] = [];

    family.members.forEach(member => {
      const role = member.Familienrolle?.toLowerCase();
      if (role === 'familienoberhaupt' || role === 'ehefrau') {
        parents.push(member);
      } else {
        children.push(member);
      }
    });

    const groupHeight = Math.max(200, 80 + (parents.length > 0 ? 80 : 0) + Math.ceil(children.length / 2) * (NODE_HEIGHT + NODE_GAP));

    nodes.push({
      id: `family-${family.familiennr}`,
      type: 'group',
      position: { x: familyX, y: familyY },
      style: {
        width: FAMILY_WIDTH, height: groupHeight,
        backgroundColor: 'rgba(249, 250, 251, 0.9)',
        border: '2px solid #e5e7eb', borderRadius: '12px',
      },
      data: { label: '' },
    });

    nodes.push({
      id: `family-label-${family.familiennr}`,
      type: 'default',
      position: { x: 10, y: 10 },
      parentId: `family-${family.familiennr}`,
      extent: 'parent',
      draggable: false,
      style: {
        width: FAMILY_WIDTH - 20, background: '#1f2937', color: 'white',
        borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 600,
        border: 'none', textAlign: 'center',
      },
      data: { label: `Familie ${family.familienname} (#${family.familiennr})` },
    });

    parents.forEach((member, index) => {
      const colors = ROLE_COLORS[member.Familienrolle || ''] || ROLE_COLORS.default;
      nodes.push({
        id: member.id,
        type: 'default',
        position: { x: 10 + index * 130, y: 55 },
        parentId: `family-${family.familiennr}`,
        extent: 'parent',
        style: {
          width: 120, background: colors.bg, border: `2px solid ${colors.border}`,
          borderRadius: '8px', padding: '6px', fontSize: '10px', color: colors.text, textAlign: 'center',
        },
        data: { label: createNodeLabel(member) },
      });
    });

    children.forEach((member, index) => {
      const colors = ROLE_COLORS[member.Familienrolle || ''] || ROLE_COLORS.default;
      const c = index % 2;
      const r = Math.floor(index / 2);
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

      if (parents.length > 0) {
        edges.push({
          id: `e-${parents[0].id}-${member.id}`,
          source: parents[0].id, target: member.id,
          style: { stroke: '#9ca3af', strokeWidth: 1 }, type: 'smoothstep',
        });
      }
    });

    if (parents.length === 2) {
      edges.push({
        id: `marriage-${family.familiennr}`,
        source: parents[0].id, target: parents[1].id,
        style: { stroke: '#ec4899', strokeWidth: 2 }, type: 'straight',
      });
    }
  });

  return { nodes, edges };
};

export default function FamilyStructureChart({ data }: FamilyStructureChartProps) {
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createFlowElements(data.families, selectedFamily),
    [data.families, selectedFamily]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when selection changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createFlowElements(data.families, selectedFamily);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedFamily, data.families, setNodes, setEdges]);

  // Get unique family numbers for dropdown
  const familyOptions = useMemo(() =>
    data.families.map(f => ({ value: f.familiennr, label: `${f.familienname} (#${f.familiennr})` })),
    [data.families]
  );

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

      {/* React Flow Container */}
      <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls position="bottom-right" />
          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith('family-label')) return '#1f2937';
              if (node.id.startsWith('family-')) return '#f3f4f6';
              return '#3b82f6';
            }}
            maskColor="rgba(255, 255, 255, 0.8)"
          />
          <Panel position="top-left" className="bg-white/90 rounded-md px-3 py-2 shadow-sm text-xs text-gray-600">
            {selectedFamily
              ? `Familie #${selectedFamily}`
              : `${Math.min(data.totalFamilies, 20)} von ${data.totalFamilies} Familien`
            } | {data.totalMembers} Personen gesamt
          </Panel>
        </ReactFlow>
      </div>

      {/* Summary Statistics */}
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
              {data.totalFamilies > 0 ? (data.totalMembers / data.totalFamilies).toFixed(1) : 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Größte Familie</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.max(...data.families.map(f => f.members.length), 0)} Mitglieder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
