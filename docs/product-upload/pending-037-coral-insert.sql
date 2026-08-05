-- Product 037 — Coral Lattice. READY TO RUN once the network is back.
-- Prerequisite: upload the images first, they are already converted and waiting:
--   node scripts/upload-product-images.mjs "<scratchpad>/coral-webp"
-- Expected public URLs are the two referenced below.

INSERT INTO public.products (
  slug, title, short_description, description,
  price, compare_at, category, subcategory, sku, status,
  featured, stock, images, palette, sizes_stock,
  seo_title, seo_description, seo_keywords, badge, faqs,
  tryon_enabled, tryon_image
) VALUES (
  'ld-coral-pink-chikankari-2-piece-suit-037',
  'Coral Lattice – 2-Piece Chikankari Suit with Digital Print Trousers',
  $spec$Stitching: Fully Stitched & Ready-to-Wear
Pieces: 2-Piece Set (No Dupatta Included)
Fabric: Soft Breathable Cotton
Shirt Colour: Coral Pink
Shirt Embroidery: All-Over Tonal Pink-on-Pink Chikankari with Openwork Eyelet Detail
Shirt: Straight-Cut, Knee-Length with Side Slits
Neckline: Round Neck with Small Centre V-Notch
Sleeves: Full-Length, Embroidered
Trousers: Wide-Leg Palazzo in Multicolour Digital Tropical Leaf Print
Package Includes: 1x Chikankari Cotton Shirt, 1x Digital Print Palazzo Trousers
Sizes Available: Small, Medium, Large
Care: Wash Separately in Cold Water, Dry in Shade, Iron on Reverse
Country of Origin: Made in Pakistan$spec$,
  $desc$Coral Lattice is a 2-piece cotton suit that runs the usual Pakistani formula backwards. Instead of a printed shirt over plain trousers, it pairs a solid coral pink chikankari shirt with wide-leg palazzo trousers in a bold multicolour digital leaf print. It arrives fully stitched in Small, Medium, or Large.

Almost every printed suit in Pakistan puts the pattern on top and leaves the bottom plain, because that is the safe arrangement. Reversing it does something the safe version cannot: the eye lands on the trousers, which lengthens the leg line, and the quieter top keeps the whole thing from tipping into costume. It is also more forgiving through the torso than a busy printed shirt, since a tonal texture does not draw attention the way a high-contrast print does.

The shirt is worked in chikankari — but tonal rather than the classic white-on-white. The embroidery is coral thread on coral fabric, built from raised floral stitching and small cut eyelets that open the cloth so light passes through and casts faint shadows. Because the thread matches the ground, the pattern reads as texture rather than as decoration, which is exactly what lets it sit under a print this loud without competing. Compare it with our off-white chikankari suit, where the same technique on white reads as crisp and formal; on coral it reads as soft and warm.

The trousers carry a digital print of tropical leaves in orange, teal, coral, and green across an ivory ground. Digital printing is what makes that range of colour possible in one design — the pattern is sprayed directly onto the fabric in a single pass rather than built up one colour at a time through separate screens, so a single leaf can hold four or five shades and a gradient between them.

This is a 2-piece set with no dupatta, and with this pairing that is the right call. There is already a solid and a print in play; a third element would be one too many. If you want to cover, use a plain chiffon in the coral of the shirt or in one of the quieter colours pulled from the trouser print — ivory or soft teal — and never another pattern.

Wear it to the office, to university, to a family lunch, or to a daytime function. It reads as contemporary rather than traditional, which makes it a good choice when you want something Pakistani but not formal. For weddings and evening events, our formal wear collection is the better fit.

Stocked in Small, Medium, and Large, with two pieces in Medium. Keep the styling minimal — gold studs or small hoops, and nude or tan footwear. Coloured shoes will fight the trouser print. Wash the two pieces separately in cold water, especially for the first few washes, since a strong coral and a multicolour print can both bleed. Do not bleach, dry in shade so the coral does not fade, and iron on the reverse so the chikankari stitching is not flattened and the eyelets keep their shape. Every suit is made in our Karachi studio in small runs. Habiba Minhas ships nationwide across Pakistan — Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta and beyond — at a flat Rs. 250, with cash on delivery and 14-day exchanges on unworn items. You can preview this suit on yourself in the Virtual Try Room before ordering.$desc$,
  3999, NULL, 'ladies-suits',
  ARRAY['stitched-suits','2-piece-suits','casual'],
  'BIBA-COR-COT-SML-037', 'active', TRUE, 4,
  ARRAY['https://ftrwdknlckzcwbibdicu.supabase.co/storage/v1/object/public/products/coral-pink-chikankari-2-piece-1.webp',
        'https://ftrwdknlckzcwbibdicu.supabase.co/storage/v1/object/public/products/coral-pink-chikankari-2-piece-2.webp'],
  ARRAY['#e85a6a','#f0ede4','#3b7ea1'],
  '{"XS":0,"S":1,"M":2,"L":1,"XL":0,"XXL":0}'::jsonb,
  'Coral Pink Chikankari 2-Piece Suit — Printed Trousers',
  'Coral pink chikankari cotton 2-piece suit — tonal embroidered shirt with digital print wide-leg trousers. No dupatta. Sizes S, M, L. Rs. 3,999. Karachi.',
  'coral pink chikankari suit Pakistan, pink chikan kari 2 piece suit, chikankari shirt with printed trouser, digital print palazzo Pakistan, tonal embroidered cotton suit, ready to wear chikankari Karachi, pink cotton suit without dupatta, printed trouser suit women Pakistan, casual 2 piece suit small medium large, contemporary Pakistani suit, Habiba Minhas ladies suits, stitched chikankari online',
  'New In',
  $faq$[
    {"question":"Is the print on the shirt or the trousers?","answer":"On the trousers. The shirt is solid coral pink with tonal chikankari embroidery, and the wide-leg palazzo trousers carry the multicolour digital tropical leaf print. That is the reverse of the usual Pakistani arrangement, where the shirt is printed and the trousers are plain."},
    {"question":"What is tonal chikankari?","answer":"Chikankari is normally white thread on white fabric. Tonal chikankari uses thread in the same colour as the ground — here coral on coral — so the raised floral stitching and cut eyelets read as texture rather than as decoration. That is what lets it sit under a bold printed trouser without the two competing."},
    {"question":"Is a dupatta included?","answer":"No, this is a 2-piece set. With a solid embroidered top and a printed bottom already in play, a third element would be one too many. If you want to cover, use a plain chiffon in the shirt's coral or in a quieter colour from the trouser print such as ivory or soft teal — never another pattern."},
    {"question":"What is digital printing on fabric?","answer":"Digital printing sprays the design directly onto the fabric in a single pass, rather than building it up one colour at a time through separate screens. That is why a single leaf in this print can hold four or five shades and a gradient between them, which screen printing cannot reproduce without a separate screen per colour."},
    {"question":"What sizes are available?","answer":"Small, Medium, and Large. Medium has two pieces in stock; Small and Large are single pieces. Each design is made in a small run, so a size will not be restocked once it sells."},
    {"question":"How much does this suit cost?","answer":"Rs. 3,999 for the 2-piece set — chikankari shirt and digital print palazzo trousers. Delivery is a flat Rs. 250 anywhere in Pakistan, and cash on delivery is available."},
    {"question":"How do I wash it without the colours bleeding?","answer":"Wash the two pieces separately in cold water, especially for the first few washes, since a strong coral and a multicolour print can both bleed. Do not bleach, dry in shade so the coral does not fade, and iron on the reverse so the chikankari stitching is not flattened and the eyelets keep their shape."},
    {"question":"What occasions is this suit suitable for?","answer":"Office, university, family lunches, and daytime functions. It reads as contemporary rather than traditional, which makes it a good choice when you want something Pakistani but not formal. For weddings and evening events, our formal wear collection is a better fit."},
    {"question":"Is this suit stitched or unstitched?","answer":"Fully stitched and ready to wear. Both pieces arrive finished in your chosen size, so there is no tailor visit and no stitching wait."},
    {"question":"How long does delivery take and do you ship outside Karachi?","answer":"We ship nationwide across Pakistan including Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta. Delivery is 3-5 business days, and Karachi orders often arrive within 2 days at a flat Rs. 250."}
  ]$faq$::jsonb,
  TRUE,
  'https://ftrwdknlckzcwbibdicu.supabase.co/storage/v1/object/public/products/coral-pink-chikankari-2-piece-1.webp'
)
RETURNING id, slug, price, sku, stock, sizes_stock, featured, badge, array_length(images,1) AS images;
