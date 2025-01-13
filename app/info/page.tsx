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
        <div>
            <h1>Datensatzinformationen</h1>
            <p>Dieser Datensatz enthält Informationen über Personen, einschließlich ihrer Namen, Geburtsdaten und Geburtsorte.</p>
            <ul>
                {dataset.map((person, index) => (
                    <li key={index}>
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