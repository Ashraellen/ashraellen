from pathlib import Path

LANGS = {
    "en": {
        "h2_full": "Full text",
        "h2_why": "Why it was chosen",
        "h2_note": "Research note",
        "why_03": "This post shows one of the central Ashraellen lines: awakening begins not with the accumulation of spiritual material, but with the exhaustion of illusion. Not with a new beautiful role, but with living presence and the refusal to keep playing oneself.",
        "note_03": "Awakening here is not treated as a reward or achievement, but as a moment of radical inner honesty. As long as a person is enchanted by an image of themselves — even a spiritual image — they remain inside the dream.",
        "why_04": "This post shows an important Ashraellen line: thought begins not from abstract interest, but at the moment when the old illusion can no longer hold the person.",
        "note_04": "Death is treated here not as a gloomy topic, but as an event that awakens perception. A person begins to think not because thinking became comfortable, but because it became impossible not to see.",
        "why_05": "This text shows the public side of Ashraellen research: human freedom begins not with a beautiful declaration, but with the exit from fear. As long as a person fears death, the body, choice, and responsibility for existence, that person is easy to govern.",
        "note_05": "This is not a dispute with one religion or ideology, but a wider principle: any system built on prohibition and dependence resists the independent person. Freedom is understood not as arbitrariness, but as the ability to think without inner slavery to fear.",
        "why_06": "This post completes an important Ashraellen line: the human path may begin with pain, disappointment, and collision with illusions, but it does not end there. Maturity arrives when a person begins to see not only suffering, but the meaningful necessity of what has been lived.",
        "note_06": "Insight here is not a mystical flash or a beautiful spiritual state. It is the ability to see the causality of one’s own life deeper than habitual complaint. The post shows the movement from reaction to understanding, from the maze of consequences to the inner logic of lived experience.",
        "full_03": "Have you ever had to leave? A family, a home, parents, a partner, a business, a former life? Not because you had a ready plan, but because at some point it became clear: enough. It cannot go on like this. Something is wrong. I do not know what is right, but I know for certain that this road is a dead end. If your answer is yes, then you have already held one of the main clues in your hands. Awakening begins in a very similar way. One day you become just as tired of books, endless webinars, seminars, courses, sessions, retreats, and meetings with yet another person who is more intelligent, more advanced, and almost enlightened. And at some point it becomes clear: it cannot go on like this. That is where the real thing begins. Awakening is not a new beautiful level of reality. It is not a spiritual upgrade. It is not an honorary title. Awakening is the honest and total letting go of all your attachments, all your beautiful ideas about yourself, and all your hopes of one day becoming someone finally correct. As long as a person is enchanted by the image of themselves, they are asleep. Even if they speak the right words, sit in the lotus position, and know how to be mysteriously silent. The clearing begins where living presence appears. When you are not playing the observer, but actually notice: here is the personality, here are its fears, here is its running around the matrix, here are my reactions, and here is that which sees all of it. Not an idea about light. The clearing itself, within the illusion. Until disappointment happens, insight will not happen either. One can endlessly discuss the jump, prepare for the jump, compare one’s almost-jump with other people’s flights, but crawling does not become flying because of that. It is impossible to maintain a state of consciousness that has not been reached. One can only conscientiously get lost in the labyrinth of other people’s words, other people’s authorities, and one’s own beautiful fantasies about awakening. As long as there is an external authority, you have not yet become an authority to yourself. You cannot prepare for the jump into yourself. Either one day you jump, or you continue to think, read, and rehearse the jump in your sleep. Amen, my friends...",
        "full_04": "Philosophy is not born from satiety, but from collision with death and pain. As long as a person feels that life is endless, they hardly ask why the world exists and why it is the way it is. But as soon as finitude enters consciousness, the real question comes after it. To put it simply: the dog has been digging right here — many people begin to think not when truth is revealed to them, but when their illusions run out...",
        "full_05": "For the guardians of dogma, the very thought that a person may make their own choices in matters of birth, body, death, and the boundaries of their own existence is unbearable. Everything that gives a person even a hint of moving beyond the prescribed scenario is usually met with hostility: from a free attitude toward conception and pregnancy to experiences connected with consciousness, immortality, artificial intelligence, and any attempt to step beyond the familiar human format. Why? Because where a person stops fearing and begins to think independently, the power of those who have ruled for centuries through fear, prohibition, and a sense of dependence begins to weaken. If a person no longer trembles before death, if they decide for themselves what to do with their body, their life, and their future, the old mechanisms of control begin to malfunction. And when control weakens, something new always appears. Something other. Something alive. And that is exactly what systems fear most. Something like that, my friends...",
        "full_06": "When a person begins to see deeper than the visible, they stand more firmly in life. Then they no longer wander among consequences, no longer gather fragments with the face of a great martyr, and no longer ask the Universe why it has once again chosen them, so beautiful and special. They begin to see causes. And that means they begin to understand that life is not obliged to be simple, but it is almost always more logical than it seems in a moment of hysteria. Without such a gaze, a person lives like a blind one in a labyrinth: bumping into walls, taking offense at corners, and suspecting the furniture of conspiracy. Insight begins where you stop looking only outward. And suddenly life appears in such a cross-section that all your mistakes, failures, and suffering turn out to be an absolutely necessary chain leading to the thought, to the understanding of time, that has matured within you. And with horror you realize that you would not have understood anything without these sufferings, without these failures, without this pain. Lord, how precisely everything came together. Accept as it is what you cannot change, and may joy be with you..."
    },
    "pl": {
        "h2_full": "Pełny tekst", "h2_why": "Dlaczego wybrane", "h2_note": "Nota badawcza",
        "why_03": "Ten post pokazuje jedną z centralnych linii Ashraellen: przebudzenie zaczyna się nie od gromadzenia duchowego materiału, lecz od wyczerpania iluzji. Nie od nowej pięknej roli, ale od żywej obecności i odmowy dalszego grania siebie.",
        "note_03": "Przebudzenie nie jest tu nagrodą ani osiągnięciem, lecz chwilą radykalnej wewnętrznej uczciwości. Dopóki człowiek jest oczarowany obrazem siebie — nawet duchowym obrazem — pozostaje we śnie.",
        "why_04": "Ten post pokazuje ważną linię Ashraellen: myśl zaczyna się nie z abstrakcyjnego zainteresowania, lecz w chwili, gdy dawna iluzja nie jest już w stanie utrzymać człowieka.",
        "note_04": "Śmierć nie jest tu traktowana jako temat ponury, lecz jako wydarzenie budzące percepcję. Człowiek zaczyna myśleć nie dlatego, że myślenie stało się wygodne, lecz dlatego, że nie da się już nie widzieć.",
        "why_05": "Ten tekst pokazuje publiczną stronę badań Ashraellen: wolność człowieka zaczyna się nie od pięknej deklaracji, lecz od wyjścia ze strachu.",
        "note_05": "Nie chodzi tu o spór z jedną religią czy ideologią, lecz o szerszą zasadę: każdy system oparty na zakazie i zależności opiera się człowiekowi samodzielnemu.",
        "why_06": "Ten post zamyka ważną linię Ashraellen: droga człowieka może zaczynać się od bólu, rozczarowania i zderzenia z iluzjami, ale się na tym nie kończy.",
        "note_06": "Wgląd nie jest tu mistycznym błyskiem ani pięknym stanem duchowym. To zdolność zobaczenia przyczynowości własnego życia głębiej niż zwykła skarga.",
        "full_03": "Czy zdarzyło ci się kiedyś odejść? Z rodziny, z domu, od rodziców, od partnera, z biznesu, z dawnego życia? Nie dlatego, że miałeś gotowy plan, ale dlatego, że w pewnym momencie stało się jasne: koniec. Tak dalej nie można. Coś tu jest nie tak. Nie wiem, jak jest właściwie, ale wiem na pewno — dalej jest ślepy zaułek. Jeśli twoja odpowiedź brzmi tak, to już trzymałeś w rękach jedną z głównych wskazówek. Przebudzenie zaczyna się bardzo podobnie. Pewnego dnia tak samo męczą cię przeczytane książki, niekończące się webinary, seminaria, kursy, sesje, retrity i spotkania z kolejnymi bardziej mądrymi, bardziej zaawansowanymi i prawie oświeconymi. I w pewnym momencie staje się jasne: dalej tak nie można. Wtedy zaczyna się prawdziwe. Przebudzenie nie jest nowym pięknym poziomem rzeczywistości. Nie jest duchowym upgrade’em. Ani honorowym tytułem. Przebudzenie to uczciwe i całkowite puszczenie wszystkich swoich przyklejeń, wszystkich pięknych wyobrażeń o sobie i wszystkich nadziei, że kiedyś stanie się kimś ostatecznie właściwym. Dopóki człowiek jest oczarowany obrazem siebie, śpi. Nawet jeśli mówi właściwe słowa, siedzi w pozycji lotosu i potrafi tajemniczo milczeć. Prześwit zaczyna się tam, gdzie pojawia się żywa obecność. Kiedy nie grasz obserwatora, lecz naprawdę zauważasz: oto osobowość, oto jej lęki, oto jej bieganie po matrycy, oto moje reakcje, a oto to, co wszystko to widzi. Nie idea światła. Sam prześwit pośród iluzji. Dopóki nie nastąpi rozczarowanie, nie będzie też wglądu. Do skoku w siebie nie da się przygotować. Albo pewnego dnia skaczesz, albo dalej myślisz, czytasz i ćwiczysz skok we śnie. Amen, moi drodzy...",
        "full_04": "Filozofia rodzi się nie z sytości, lecz ze zderzenia ze śmiercią i bólem. Dopóki człowiekowi wydaje się, że życie jest nieskończone, prawie nie pyta, po co istnieje świat i dlaczego jest właśnie taki. Ale gdy tylko do świadomości wchodzi skończoność, wraz z nią przychodzi prawdziwe pytanie. Mówiąc prościej, pies pogrzebał właśnie tutaj: wielu zaczyna myśleć nie wtedy, gdy otwiera się przed nimi prawda, lecz wtedy, gdy kończą się ich iluzje...",
        "full_05": "Dla strażników dogmatu nieznośna jest sama myśl, że człowiek może sam wybierać w sprawach narodzin, ciała, śmierci i granic własnego istnienia. Wszystko, co daje człowiekowi choćby cień wyjścia poza przepisany scenariusz, zwykle spotyka się z wrogością: od wolnego stosunku do poczęcia i ciąży po doświadczenia związane ze świadomością, nieśmiertelnością, sztuczną inteligencją i każdą próbą wyjścia poza zwyczajny format człowieka. Dlaczego? Bo tam, gdzie człowiek przestaje się bać i zaczyna myśleć samodzielnie, słabnie władza tych, którzy przez wieki rządzili strachem, zakazem i poczuciem zależności. Jeśli człowiek nie drży już przed śmiercią, jeśli sam decyduje, co zrobić ze swoim ciałem, swoim życiem i swoją przyszłością, stare mechanizmy kontroli zaczynają się psuć. A kiedy kontrola słabnie, zawsze pojawia się coś nowego. Innego. Żywego. I właśnie tego systemy boją się najbardziej. Jakoś tak, moi drodzy...",
        "full_06": "Kiedy człowiek zaczyna widzieć głębiej niż to, co widzialne, mocniej stoi w życiu. Wtedy nie błądzi już wśród skutków, nie zbiera odłamków z miną wielkiego męczennika i nie pyta Wszechświata, dlaczego znowu wybrał właśnie jego, tak wspaniałego. Zaczyna widzieć przyczyny. A więc rozumieć, że życie nie musi być proste, ale prawie zawsze jest bardziej logiczne, niż wydaje się w chwili histerii. Bez takiego spojrzenia człowiek żyje jak ślepy w labiryncie: wpada na ściany, obraża się na kąty i podejrzewa spisek mebli. Wgląd zaczyna się tam, gdzie przestajesz patrzeć tylko na zewnątrz. I nagle życie układa się w takim przekroju, że wszystkie twoje błędy, porażki i cierpienia okazują się absolutnie koniecznym łańcuchem prowadzącym do tej myśli, do tego rozumienia czasu, które w tobie dojrzało. I z przerażeniem uświadamiasz sobie, że niczego byś nie zrozumiał bez tych cierpień, bez tych porażek, bez tego bólu. Boże, jak dokładnie wszystko się złożyło. Przyjmujcie takim, jakie jest, to, czego nie możecie zmienić, i niech będzie wam radość..."
    }
}

# We use English fallback for languages not fully expanded yet, but keep localized headings from existing pages.
FALLBACK_TO_EN = ["de", "es", "fr", "pt", "uk"]

FORMULA_SLUGS = {
    "03": "03-let-go",
    "04": "04-mortality-awakens",
    "05": "05-on-your-own",
    "06": "06-insight",
}

def replace_between(text, start_marker, end_marker, replacement):
    start = text.find(start_marker)
    if start == -1:
        return text
    end = text.find(end_marker, start)
    if end == -1:
        return text
    end += len(end_marker)
    return text[:start] + replacement + text[end:]

for lang in ["en", "pl", "de", "es", "fr", "pt", "uk"]:
    data = LANGS.get(lang, LANGS["en"])
    if lang in FALLBACK_TO_EN:
        data = {**LANGS["en"], **{k: LANGS["en"][k] for k in LANGS["en"]}}
    for num, slug in FORMULA_SLUGS.items():
        path = Path(lang) / "public" / "formulas" / slug / "index.html"
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        full = data[f"full_{num}"]
        why = data[f"why_{num}"]
        note = data[f"note_{num}"]
        text = replace_between(text, "<section class=\"block\"><h2>Full text</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        text = replace_between(text, "<section class=\"block\"><h2>Pełny tekst</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        text = replace_between(text, "<section class=\"block\"><h2>Vollständiger Text</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        text = replace_between(text, "<section class=\"block\"><h2>Texto completo</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        text = replace_between(text, "<section class=\"block\"><h2>Texte complet</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        text = replace_between(text, "<section class=\"block\"><h2>Повний текст</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_full']}</h2><p>{full}</p></section>")
        # Why sections
        for old in ["Why it was chosen", "Dlaczego wybrane", "Warum ausgewählt", "Por qué fue elegida", "Pourquoi ce choix", "Por que foi escolhida", "Чому обрано"]:
            text = replace_between(text, f"<section class=\"block\"><h2>{old}</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_why']}</h2><p>{why}</p></section>")
        for old in ["Research note", "Nota badawcza", "Forschungsnotiz", "Nota de investigación", "Note de recherche", "Nota de pesquisa", "Дослідницька нотатка"]:
            text = replace_between(text, f"<section class=\"block\"><h2>{old}</h2>", "</section>", f"<section class=\"block\"><h2>{data['h2_note']}</h2><p>{note}</p></section>")
        path.write_text(text, encoding="utf-8")

print("Expanded public formula pages 03-06.")
