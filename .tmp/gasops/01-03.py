from pathlib import Path
import json
OPS=json.loads('{"assets/tokens.css":[[31,43,43,"",";\\n\\n  /* registry role — deliberate exception, not part of the five narrative roles.\\n     Dense, repeating monospace index content (e.g. GAS\'s Registry of Meanings:\\n     45 entries across 15 chapters), not running prose and not a one-off kicker\\n     label. Introduced 2026-08 alongside the GAS page type. */\\n  --fs-registry: 11px;\\n  --lh-registry: 1.45"]]}')
for path, ops in OPS.items():
    p=Path(path)
    if not p.exists():
        assert all(o[0]==0 and o[1]==0 and o[2]==0 and o[3]=="" for o in ops), path
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text("".join(o[4] for o in ops))
        continue
    text=p.read_text(); original=text
    starts=[0]
    for i,ch in enumerate(original):
        if ch=="\n": starts.append(i+1)
    edits=[]
    for line_start,rel_s,rel_e,old,new in ops:
        base=starts[line_start-1] if line_start>0 else 0
        s=base+rel_s; e=base+rel_e
        assert original[s:e]==old,(path,line_start,rel_s,repr(old[:160]),repr(original[s:e][:160]))
        edits.append((s,e,new))
    for s,e,new in sorted(edits,key=lambda x:x[0],reverse=True): text=text[:s]+new+text[e:]
    p.write_text(text)
from pathlib import Path
import json
OPS=json.loads('{"be/books/monolith/gas/index.html":[[5,180,1951,"<link rel=\\"stylesheet\\" href=\\"../../../../assets/books.css?v=20260217\\">\\n<style>\\n.page::before{background-image:url(\'../../../../assets/backgrounds/monolith-bg.webp\');filter:brightness(.48) contrast(1.08) saturate(.72) blur(1.5px)}\\n.book-hero{display:grid;grid-template-columns:220px 1fr;gap:22px;align-items:start}.book-cover{border-radius:16px;overflow:hidden;border:1px solid rgba(242,242,244,.14);background:rgba(0,0,0,.18)}.book-cover img{display:block;width:100%;height:auto}\\n.protocol{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--muted);font-size:12px;letter-spacing:.04em}.gas-copy{font-size:13px;line-height:1.78;color:var(--muted);max-width:82ch}.gas-copy p{margin:0 0 12px}.quote-line{font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.4;color:var(--fg)}\\n.gas-grid,.registry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:14px}.gas-card,.gas-link-box{border:1px solid rgba(242,242,244,.12);border-radius:14px;padding:14px;background:rgba(0,0,0,.20)}.gas-card h3{margin:0 0 7px;color:var(--fg);font-size:15px}.gas-card p{margin:0 0 6px;color:var(--muted);font-size:13px;line-height:1.55}.registry-card p{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.45}\\n.gas-fragment{margin-top:12px;border:1px solid rgba(242,242,244,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.20)}.gas-fragment summary{cursor:pointer;color:var(--fg);font-weight:700}.gas-fragment-body{margin-top:12px}.cta-row .btn{font-size:12px;padding:10px 14px;font-weight:700}@media(max-width:900px){.gas-grid,.registry-grid{grid-template-columns:1fr}}@media(max-width:700px){.book-hero{grid-template-columns:1fr}.book-cover{max-width:260px}}\\n</style>","<link rel=\\"stylesheet\\" href=\\"../../../../assets/gas.css?v=20260813-1\\">"],[24,430,528,"<ul class=\\"items\\"><li class=\\"item\\" style=\\"grid-template-columns:1fr;\\"><div class=\\"body book-hero\\">","<div class=\\"book-hero\\">"],[24,1546,1546,"","<span class=\\"when-closed\\">"],[24,1568,1568,"","</span><span class=\\"when-open\\">Закрыць поўны пратакол</span>"],[24,3828,3838,"</li></ul>",""],[24,4135,4135,"","<span class=\\"when-closed\\">"],[24,4151,4151,"","</span><span class=\\"when-open\\">Закрыць фрагмент</span>"],[38,2268,2268,"","<span class=\\"when-closed\\">"],[38,2298,2298,"","</span><span class=\\"when-open\\">Закрыць неўлічаны фрагмент № 0</span>"]]}')
for path, ops in OPS.items():
    p=Path(path)
    if not p.exists():
        assert all(o[0]==0 and o[1]==0 and o[2]==0 and o[3]=="" for o in ops), path
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text("".join(o[4] for o in ops))
        continue
    text=p.read_text(); original=text
    starts=[0]
    for i,ch in enumerate(original):
        if ch=="\n": starts.append(i+1)
    edits=[]
    for line_start,rel_s,rel_e,old,new in ops:
        base=starts[line_start-1] if line_start>0 else 0
        s=base+rel_s; e=base+rel_e
        assert original[s:e]==old,(path,line_start,rel_s,repr(old[:160]),repr(original[s:e][:160]))
        edits.append((s,e,new))
    for s,e,new in sorted(edits,key=lambda x:x[0],reverse=True): text=text[:s]+new+text[e:]
    p.write_text(text)
from pathlib import Path
import json
OPS=json.loads('{"de/books/monolith/gas/index.html":[[6,864,2635,"<link rel=\\"stylesheet\\" href=\\"../../../../assets/books.css?v=20260217\\">\\n<style>\\n.page::before{background-image:url(\'../../../../assets/backgrounds/monolith-bg.webp\');filter:brightness(.48) contrast(1.08) saturate(.72) blur(1.5px)}\\n.book-hero{display:grid;grid-template-columns:220px 1fr;gap:22px;align-items:start}.book-cover{border-radius:16px;overflow:hidden;border:1px solid rgba(242,242,244,.14);background:rgba(0,0,0,.18)}.book-cover img{display:block;width:100%;height:auto}\\n.protocol{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--muted);font-size:12px;letter-spacing:.04em}.gas-copy{font-size:13px;line-height:1.78;color:var(--muted);max-width:82ch}.gas-copy p{margin:0 0 12px}.quote-line{font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.4;color:var(--fg)}\\n.gas-grid,.registry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:14px}.gas-card,.gas-link-box{border:1px solid rgba(242,242,244,.12);border-radius:14px;padding:14px;background:rgba(0,0,0,.20)}.gas-card h3{margin:0 0 7px;color:var(--fg);font-size:15px}.gas-card p{margin:0 0 6px;color:var(--muted);font-size:13px;line-height:1.55}.registry-card p{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.45}\\n.gas-fragment{margin-top:12px;border:1px solid rgba(242,242,244,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.20)}.gas-fragment summary{cursor:pointer;color:var(--fg);font-weight:700}.gas-fragment-body{margin-top:12px}.cta-row .btn{font-size:12px;padding:10px 14px;font-weight:700}@media(max-width:900px){.gas-grid,.registry-grid{grid-template-columns:1fr}}@media(max-width:700px){.book-hero{grid-template-columns:1fr}.book-cover{max-width:260px}}\\n</style>","<link rel=\\"stylesheet\\" href=\\"../../../../assets/gas.css?v=20260813-1\\">"],[25,472,570,"<ul class=\\"items\\"><li class=\\"item\\" style=\\"grid-template-columns:1fr;\\"><div class=\\"body book-hero\\">","<div class=\\"book-hero\\">"],[25,1617,1617,"","<span class=\\"when-closed\\">"],[25,1647,1647,"","</span><span class=\\"when-open\\">Vollständiges Protokoll schließen</span>"],[25,4187,4197,"</li></ul>",""],[25,4503,4503,"","<span class=\\"when-closed\\">"],[25,4516,4516,"","</span><span class=\\"when-open\\">Auszug schließen</span>"],[25,9420,9420,"","<section id=\\"author-note\\" class=\\"list\\"><div class=\\"list-header\\"><h2>Vom Autor</h2><p class=\\"note\\">zur Form des abschließenden Bandes</p></div><div class=\\"gas-copy\\"><p>In GAS wird das Verschwinden der Form nicht zur endgültigen Zerstörung. Es wird zu einem neuen Problem: Wenn sich Quelle, Träger und Ausbreitungsgrenze eines Signals nicht mehr zuverlässig bestimmen lassen, wird der Beobachter selbst zum Teil des Mediums.</p><p>Deshalb bewahrt der abschließende Band die dokumentarische Grundform von MONOLITH — Protokolle, Archive, Zugangsstufen, Register, Spuren und amtliche Formulierungen —, während er dem System zugleich zunehmend die Fähigkeit nimmt, den Ursprung des Geschehens zu bestimmen.</p></div></section><section id=\\"spoiler-free\\" class=\\"list\\"><div class=\\"list-header\\"><h2>Ohne Spoiler</h2><p class=\\"note\\">was den Leser erwartet</p></div><div class=\\"gas-copy\\"><p>Der Roman verbindet den abgeschotteten Raum eines Palastes, dienstliche Verfahren, archivarische Ermittlung und psychologische Spannung. Entscheidend ist nicht nur, was geschieht, sondern wie sich die Gewissheit des Beobachters über die eigene Position innerhalb des Beobachteten verändert.</p><p>Die Leserschaft bewegt sich durch Duplikate, Korrekturen, Zugangsregime, archivarische Lücken, Spuren am Körper und Mitteilungen ohne verlässlich festgestellte Quelle.</p><p>Die Spannung stützt sich nicht auf einen einzelnen äußeren Gegner. Sie wächst aus dem allmählichen Verschwinden der Gewissheit, dass der Beobachter tatsächlich außerhalb des Prozesses steht.</p></div></section>"],[25,14527,14527,"","<section id=\\"for-whom\\" class=\\"list\\"><div class=\\"list-header\\"><h2>Für wen dieses Buch ist</h2><p class=\\"note\\">Einstieg für Leserinnen und Leser</p></div><div class=\\"gas-copy\\"><p>Für Leserinnen und Leser von Dystopien, philosophischer Prosa und psychologischen Thrillern, die Macht nicht nur als Zwangsapparat interessiert, sondern als System zur Kontrolle von Bild, Erinnerung, Sprache und zulässiger Wahrnehmung.</p><p>Für alle, die Geschichten suchen, in denen eine Ermittlung schrittweise die Position der beobachtenden Person selbst verändert — und der zentrale Konflikt nicht nur zwischen Mensch und System verläuft, sondern durch die Frage, ob sich eine innere Grenze bewahren lässt, während man sich bereits innerhalb des Mediums befindet.</p></div></section>"],[25,16863,16863,"","<span class=\\"when-closed\\">"],[25,16900,16900,"","</span><span class=\\"when-open\\">Nicht erfasstes Fragment Nr. 0 schließen</span>"]]}')
for path, ops in OPS.items():
    p=Path(path)
    if not p.exists():
        assert all(o[0]==0 and o[1]==0 and o[2]==0 and o[3]=="" for o in ops), path
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text("".join(o[4] for o in ops))
        continue
    text=p.read_text(); original=text
    starts=[0]
    for i,ch in enumerate(original):
        if ch=="\n": starts.append(i+1)
    edits=[]
    for line_start,rel_s,rel_e,old,new in ops:
        base=starts[line_start-1] if line_start>0 else 0
        s=base+rel_s; e=base+rel_e
        assert original[s:e]==old,(path,line_start,rel_s,repr(old[:160]),repr(original[s:e][:160]))
        edits.append((s,e,new))
    for s,e,new in sorted(edits,key=lambda x:x[0],reverse=True): text=text[:s]+new+text[e:]
    p.write_text(text)
