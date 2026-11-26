# Demo guide: showing Mivora in a meeting

How to show Mivora on your phone in a meeting, without anything going online. The app runs on your laptop on demo data. Phones on the same Wi-Fi open it.

## The day before

1. Charge the laptop and phone. Close other apps that use port 3000 (an older Mivora demo is stopped automatically).
2. Run the demo once at home (below) and click through the path, so the first build is not done in the meeting.
3. Keep the pitch deck open in a browser tab as a backup.

## In the meeting

```bash
pnpm demo:phone
```

If an older Mivora demo is still running on port 3000, it is stopped first. Then it builds the app (about 1–2 minutes) and prints a **phone link** like `http://192.168.x.x:3000/de` and a QR code. Scan the QR code with the phone camera.

- Phone and laptop must be on the **same Wi-Fi**. Guest Wi-Fi often blocks devices from seeing each other. If the phone can't open the link, turn on your **phone's hotspot**, connect the laptop to it, and run the command again.
- On the laptop, the desktop page also shows a QR code (bottom right / footer) that points to the same link.
- Stop with `Ctrl+C`.
- Without internet, listing photos and the map tiles don't load; everything else works.

Fallback without a phone: `pnpm dev:present`, then open `http://localhost:3000` on the laptop and use the browser's phone view.

## Click path (about 3 minutes)

Move around with the app's own buttons and bottom bar. A full page reload shows the splash screen again for a few seconds.

1. **Welcome**: pick *Köln*, enter children's ages (e.g. 4 and 8). Show the language switch: Arabic flips the whole app right-to-left.
2. **Start**: weekend days, ideas, rainy-day tip.
3. **Entdecken**: 32 listings across Köln; tap **Wochenende**. Open **Filter**: age, district, free, language. Switch to **Karte**.
4. Open an activity (e.g. *Familien-Yoga*): next dates, price, provider, "last checked" date and source. Tap ♡ to save it and **Einplanen** on a date.
5. **Kalender**: the planned day is marked; tap it, and see ideas for days with nothing planned. (Per-child planning and overlap warnings need a signed-in account and a database, so they are not part of the demo.)
6. **Für Anbieter** (via **Profil**, or the footer on a laptop): what clubs and studios get.

## Say it honestly

- All listings are invented and marked "Demo".
- Nothing is online yet; translations are not checked by native speakers; no legal review yet.
- Next step is the 90-day Köln pilot ([04-launch-budget-risks.md](04-launch-budget-risks.md)).
