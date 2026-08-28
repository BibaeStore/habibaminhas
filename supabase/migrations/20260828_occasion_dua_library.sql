-- A vetted library of duas, and one dua per poster.
--
-- The owner shared a reference poster they liked. It carried FOUR duas, and the first was
-- attributed to "Surah An-Nur: 24:31" -- which is not that verse. Their own brief for the
-- design said one dua and no invented references, and the image model had broken both while
-- being told not to.
--
-- A model asked for a dua *and* its source produces a confident source about as often as a
-- correct one. On a Muslim-audience brand account a misattributed ayah is a serious error, not
-- a typo. So the words stop coming from the model: it picks a row from this table by id, and
-- the Arabic, transliteration and meaning are read from the row.
--
-- `reference` is nullable and empty for every seeded row, on purpose. A source is printed only
-- once a human has checked it. Nothing here prints one today.

create table if not exists public.social_dua_library (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,                 -- islamic | national | international | seasonal
  title       text not null,                 -- heads the card: "Dua for Forgiveness"
  arabic      text,                          -- null for non-Islamic entries
  transliteration text,
  meaning     text not null,
  reference   text,                          -- set BY HAND only, never by a model
  enabled     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists social_dua_library_category
  on public.social_dua_library (category) where enabled;

-- Eight widely-accepted supplications. Nothing sectarian, nothing disputed, no verse numbers.
insert into public.social_dua_library (category, title, arabic, transliteration, meaning) values
  ('islamic', 'Dua for Forgiveness',
   'رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي',
   'Rabbi-ghfir li warhamni wahdini wa ''afini warzuqni',
   'My Lord, forgive me, have mercy on me, guide me, grant me well-being and provide for me.'),
  ('islamic', 'Durood Sharif',
   'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
   'Allahumma salli ''ala Muhammadin wa ''ala aali Muhammad',
   'O Allah, send Your blessings upon Muhammad and upon the family of Muhammad.'),
  ('islamic', 'Dua of Istighfar',
   'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ',
   'Astaghfirullaha rabbi min kulli dhanbin wa atubu ilayh',
   'I seek forgiveness from Allah, my Lord, from every sin, and I turn to Him in repentance.'),
  ('islamic', 'Dua for Well-being',
   'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
   'Allahumma inni as''aluka al-''afiyata fid-dunya wal-akhirah',
   'O Allah, I ask You for well-being in this world and in the Hereafter.'),
  ('islamic', 'Dua for Good in Both Worlds',
   'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
   'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina ''adhaban-nar',
   'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.'),
  ('islamic', 'Dua for a Steadfast Heart',
   'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً',
   'Rabbana la tuzigh qulubana ba''da idh hadaytana wa hab lana min ladunka rahmah',
   'Our Lord, let not our hearts deviate after You have guided us, and grant us mercy from Yourself.'),
  ('islamic', 'Dua for Ease',
   'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
   'Allahumma la sahla illa ma ja''altahu sahla',
   'O Allah, there is no ease except in what You have made easy.'),
  ('islamic', 'Dua for Parents',
   'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
   'Rabbi-rhamhuma kama rabbayani saghira',
   'My Lord, have mercy upon them as they raised me when I was small.')
on conflict do nothing;
