import React from 'react';

const InfoPage: React.FC = () => {
    const dataset = [
        {
            name: 'John Doe',
            birthDate: '1990-01-01',
            birthPlace: 'New York, USA',
        },
        {
            name: 'Jane Smith',
            birthDate: '1985-05-15',
            birthPlace: 'London, UK',
        },
        {
            name: 'Carlos Garcia',
            birthDate: '1978-09-23',
            birthPlace: 'Madrid, Spanien',
        },
    ];

    return (
        <div className="font-sans p-5 max-w-xl mx-auto bg-gray-100 rounded-lg shadow-lg mt-28">
            <h1 className="text-2xl mb-4 text-gray-800">Datensatzinformationen</h1>
            <p className="text-lg mb-5 text-gray-600">Dieser Datensatz enthält Informationen über Personen, einschließlich ihrer Namen, Geburtsdaten und Geburtsorte.</p>
            <ul className="list-none p-0">
                {dataset.map((person, index) => (
                    <li key={index} className="bg-white p-4 mb-3 rounded shadow">
                        <strong>Name:</strong> {person.name}<br />
                        <strong>Geburtsdatum:</strong> {person.birthDate}<br />
                        <strong>Geburtsort:</strong> {person.birthPlace}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InfoPage;
