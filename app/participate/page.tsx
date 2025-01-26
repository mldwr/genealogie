import React from 'react';

const ParticipatePage: React.FC = () => {
    return (
        <div className="font-sans p-5 max-w-xl mx-auto bg-gray-100 rounded-lg shadow-lg mt-28">
            <div className="flex flex-col p-4">
                <h1 className="text-4xl font-bold mb-8">Teilnahme am Projekt</h1>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Schritt 1: Erstellen Sie ein Konto</h2>
                    <p className="mb-4">
                        Um an diesem Projekt teilzunehmen, müssen Sie zuerst ein Konto erstellen. Folgen Sie diesen Schritten:
                    </p>
                    <ol className="list-decimal list-inside mb-4">
                        <li>Gehen Sie zur Registrierungsseite.</li>
                        <li>Geben Sie Ihre persönlichen Daten ein, einschließlich Name, E-Mail-Adresse und Passwort.</li>
                        <li>Klicken Sie auf "Registrieren", um Ihr Konto zu erstellen.</li>
                        <li>Überprüfen Sie Ihre E-Mail und bestätigen Sie Ihre Registrierung.</li>
                    </ol>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Schritt 2: Daten einfügen</h2>
                    <p className="mb-4">
                        Nachdem Sie Ihr Konto erstellt haben, können Sie Daten in das Projekt einfügen. Folgen Sie diesen Schritten:
                    </p>
                    <ol className="list-decimal list-inside mb-4">
                        <li>Melden Sie sich mit Ihrem neuen Konto an.</li>
                        <li>Gehen Sie zur Seite "Daten einfügen".</li>
                        <li>Füllen Sie das Formular mit den erforderlichen Informationen aus.</li>
                        <li>Klicken Sie auf "Einfügen", um Ihre Daten zu speichern.</li>
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default ParticipatePage;
