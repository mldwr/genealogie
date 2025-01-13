import React from 'react';

const ParticipatePage: React.FC = () => {
    return (
        <div>
            <h1>Teilnahme am Projekt</h1>
            <section>
                <h2>Schritt 1: Erstellen Sie ein Konto</h2>
                <p>
                    Um an diesem Projekt teilzunehmen, müssen Sie zuerst ein Konto erstellen. Folgen Sie diesen Schritten:
                </p>
                <ol>
                    <li>Gehen Sie zur Registrierungsseite.</li>
                    <li>Geben Sie Ihre persönlichen Daten ein, einschließlich Name, E-Mail-Adresse und Passwort.</li>
                    <li>Klicken Sie auf "Registrieren", um Ihr Konto zu erstellen.</li>
                    <li>Überprüfen Sie Ihre E-Mail und bestätigen Sie Ihre Registrierung.</li>
                </ol>
            </section>
            <section>
                <h2>Schritt 2: Daten einfügen</h2>
                <p>
                    Nachdem Sie Ihr Konto erstellt haben, können Sie Daten in das Projekt einfügen. Folgen Sie diesen Schritten:
                </p>
                <ol>
                    <li>Melden Sie sich mit Ihrem neuen Konto an.</li>
                    <li>Gehen Sie zur Seite "Daten einfügen".</li>
                    <li>Füllen Sie das Formular mit den erforderlichen Informationen aus.</li>
                    <li>Klicken Sie auf "Einfügen", um Ihre Daten zu speichern.</li>
                </ol>
            </section>
        </div>
    );
};

export default ParticipatePage;