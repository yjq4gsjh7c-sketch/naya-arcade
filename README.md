# Naya Arcade

Drei kinderfreundliche Spiele mit deutscher Oberfläche: Blöcke, Memory und **Meine Welt**, eine eigene 3D-Bauwelt. Läuft in Safari auf dem iPad mit Bildschirmsteuerung.

## Meine Welt

Dinge aus der Bildleiste direkt auf die Wiese ziehen. Ein kurzer Tipp fügt sie alternativ an einer freien Stelle ein. Bestehende Dinge lassen sich ohne Werkzeugmodus verschieben. Zum Entfernen in den grossen Papierkorb ziehen oder ein Ding antippen und den Papierkorb wählen. Die obere Rückgängig-Pfeiltaste stellt Änderungen wieder her. Die Vorschau zeigt freie Plätze grün und gesperrte Plätze rot.

Haus, Stall und eingezäunte Weide gibt es mit 2 × 2, 3 × 3 oder 4 × 4 Feldern. Die Grösse eines ausgewählten Gebäudes kann über die Bildraster verändert werden, sofern alles darin Platz hat. Inhalt wird beim Verschieben oder Drehen mitgenommen. Möbel gehören ins Haus oder in den Stall; Dächer öffnen sich beim Einrichten. Tiere lassen sich in Stall oder Weide ziehen, bleiben darin und fressen dort selbstständig. Entfernen eines Gebäudes erhält die Tiere auf der Wiese; Rückgängig stellt auch Möbel wieder her.

Vier Kategorien mit echten Modellminiaturen, grosse Bildtasten, Musik und Tag/Nacht. Alle Modelle stehen auf der Wiese. Bis zu 100 Dinge. Gespeicherte Welten aus der ersten Version werden übernommen; eine leere gespeicherte Welt bleibt leer.

## Tests

`node tests/world-rules.cjs` prüft Platzgrenzen, Zusammenstösse, Möbel in Gebäuden, Stall-/Weidezuordnung und das Mitnehmen von Inhalt beim Verschieben und Drehen. Interaktionen zusätzlich im Browser prüfen, insbesondere Drag-and-drop, Papierkorb und Rückgängig sowie iPad-Hochformat.


Die Welt und Arcade-Rekorde werden lokal im Browser gespeichert. Sie synchronisieren sich nicht zwischen Geräten und können durch Löschen der Website-Daten verloren gehen. Die Dateien werden nach dem ersten Onlinebesuch für Offlinebetrieb zwischengespeichert.

## Entwicklung und Veröffentlichung

Statische Dateien ohne Buildschritt. Lokal z. B. mit einem HTTP-Server starten. GitHub Pages veröffentlicht den main-Zweig aus dem Stammverzeichnis. Änderungen an zwischengespeicherten Dateien erfordern eine neue Cache-Version in sw.js. Bestehende Speicherformate bei Erweiterungen erhalten oder migrieren.

3D: Three.js 0.160.1, lokal mitgeliefert unter vendor; MIT-Lizenz in vendor/THREE-LICENSE.txt. Geometrien und Musik werden im Spiel erzeugt; keine externen Assetdienste und keine Konten erforderlich.
