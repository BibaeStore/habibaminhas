# PHASE 5A: Subcategory Pages Database Updates

**Date**: 2026-06-08  
**Task**: Update categories table in Supabase  
**Pages**: 8 subcategory pages  
**Implementation**: Database SQL updates

---

## HOW TO IMPLEMENT

These subcategory pages pull content from the **categories** table in Supabase.

You need to update 4 fields for each subcategory:
1. `seo_title` — Meta title
2. `seo_desc` — Meta description  
3. `description` — Long-form content (450 words)
4. (Optional) `keywords` — If field exists

---

## DATABASE UPDATE QUERIES

Run these in Supabase SQL Editor:

---

### 1. UPDATE /ladies/3-piece-suits/

```sql
UPDATE categories 
SET 
  seo_title = '3-Piece Silk Suits Pakistan | Ladies Formal Wear | Habiba Minhas',
  seo_desc = 'Shop handcrafted 3-piece silk suits for Pakistani women. Premium formal wear with gold brocade & artisan embroidery. Perfect for weddings, Eid & celebrations. Made in Karachi.',
  description = '# 3-Piece Silk Suits for Pakistani Women

Our 3-piece suit collection represents the essence of traditional Pakistani formal wear — a complete ensemble consisting of a beautifully embroidered kameez (shirt), matching shalwar (trousers), and a flowing dupatta. Each suit is handcrafted in our Karachi studio, featuring premium silk fabrics, artisan embroidery, and gold brocade details that honor Pakistan''s rich textile heritage.

## When to Wear 3-Piece Suits

3-piece suits are the ultimate versatile choice for Pakistani women. Perfect for weddings (mehndi, barat, walima), Eid celebrations, formal dinners, and festive occasions. The complete three-piece set means you''re dressed with no additional styling needed — just add jewelry and you''re ready. Our customers wear these for everything from intimate family gatherings to grand wedding receptions.

Whether you''re attending a daytime mehndi or an evening walima, our 3-piece suits offer the perfect balance of tradition and elegance. The coordinated ensemble eliminates styling guesswork while maintaining the sophisticated look Pakistani formal events demand.

## Craftsmanship & Materials

Every 3-piece suit in our collection uses premium silk fabrics sourced from trusted mills across Pakistan. The embroidery is done by hand — each piece passes through artisan embroiderers who specialize in traditional Pakistani techniques like zardozi (gold thread work), mirror work (shisha), and intricate beadwork.

The dupatta is the signature element, featuring coordinating embroidery and delicate borders that complete the ensemble. Our artisans spend hours perfecting each piece, ensuring the embroidery motifs flow seamlessly across the kameez and dupatta. The shalwar is tailored for comfort while maintaining a refined silhouette.

We work with the same embroidery families for years, many of whom have perfected their craft over generations. This relationship ensures consistent quality and supports traditional Pakistani artisan communities in Karachi.

## Styling Your 3-Piece Suit

The beauty of a 3-piece suit lies in its completeness. The kameez, shalwar, and dupatta are designed to work together, creating a cohesive look. For weddings, drape the dupatta traditionally over one shoulder or try modern draping styles from our [dupatta styling guide](/journal/7-ways-drape-dupatta-weddings-formal-events).

Pair your suit with statement jhumkas (earrings) and a clutch for evening events, or keep jewelry minimal for daytime occasions. The embroidery on our suits is substantial enough to shine on its own without requiring heavy accessorizing.

## Frequently Asked Questions

**Are these suits stitched or unstitched?**

All our 3-piece suits are ready-to-wear (stitched) in standard Pakistani sizes. We offer sizes XS through XL, with detailed size charts available on each product page. If you need custom sizing, please contact us for bulk orders of 5+ pieces.

**How do I care for silk 3-piece suits?**

We recommend dry cleaning for heavily embroidered pieces to protect the threadwork and maintain the silk''s luster. For lighter silk suits with minimal embroidery, hand washing in cold water with mild detergent is acceptable. Always air dry and avoid direct sunlight. See our complete [silk care guide](/journal/how-to-care-for-silk-suits-at-home-pakistan) for detailed instructions.

**Can I wear these for both day and evening events?**

Absolutely! Our 3-piece suit collection ranges from elegant daytime pieces with lighter embroidery to heavily embellished evening wear perfect for night weddings. Check the product description for occasion recommendations — we specify whether each suit works best for day, evening, or both.

**What''s the difference between party wear and formal wear 3-piece suits?**

Formal wear suits typically feature more extensive embroidery, heavier embellishments, and richer fabrics — perfect for wedding functions like barat and walima. Party wear tends to be slightly lighter with contemporary cuts, ideal for dinners and celebrations. See our [Pakistani formal wear guide](/journal/pakistani-formal-wear-guide-party-semi-formal-festive) for detailed comparisons.

**Do all 3-piece suits come with a dupatta?**

Yes, every 3-piece suit includes all three pieces: kameez (shirt), shalwar (trousers), and dupatta (scarf). The dupatta features coordinating embroidery or embellishments that complement the kameez design.'
WHERE slug = '3-piece-suits';
```

---

### 2. UPDATE /ladies/formal-wear/

```sql
UPDATE categories 
SET 
  seo_title = 'Ladies Formal Wear Pakistan | Pakistani Wedding Outfits | Habiba Minhas',
  seo_desc = 'Elegant ladies formal wear for Pakistani weddings & events. Handcrafted silk suits with premium embroidery. Perfect for mehndi, barat & walima. Shop formal outfits online Pakistan.',
  description = '# Ladies Formal Wear Pakistan

Our ladies formal wear collection showcases the finest in Pakistani ceremonial dressing. From intricately embroidered 3-piece suits to statement-making ensembles, each piece is designed for the moments that matter most — weddings, engagements, and milestone celebrations across Pakistan.

## What Defines Formal Wear in Pakistan

In Pakistani culture, formal wear represents more than clothing — it''s a celebration of craftsmanship, tradition, and occasion. Formal wear features substantial embroidery, premium fabrics like silk and chiffon, and embellishments such as gold brocade, sequins, and hand-stitched threadwork. These pieces are created for significant events where elegance and tradition intersect.

Unlike party wear or semi-formal options, formal wear makes a statement. The embroidery is heavier, the fabrics are richer, and the overall look is designed to photograph beautifully and stand out at crowded celebrations. When you''re attending a Pakistani wedding as a guest or close family member, formal wear is your go-to choice.

## Types of Formal Wear in Our Collection

**3-Piece Formal Suits**: The classic choice featuring kameez, shalwar, and heavily embroidered dupatta. Perfect for wedding guests and family members.

**Embroidered Ensembles**: Complete coordinated sets with matching dupattas, designed specifically for barat and walima functions.

**Silk Formal Wear**: Luxurious silk-based pieces with gold threadwork, ideal for evening wedding events and formal receptions.

**Occasion-Specific Formal Wear**: Pieces designed for specific functions — lighter for mehndi, heavily embellished for barat, elegant for walima.

## Styling Your Formal Wear

Formal wear calls for complementary accessories that enhance rather than compete. Pair your embroidered suit with statement gold jewelry — jhumkas (traditional earrings), a maang tikka, or bangles work beautifully. Keep your clutch elegant and coordinated with your outfit''s color palette.

For dupatta draping, traditional styles work best with formal wear. A single-shoulder drape or the classic over-both-shoulders style maintains the formal aesthetic. Our [styling guide](/journal/how-to-style-silk-suit-pakistani-wedding) offers detailed tips for wedding-specific styling.

Footwear should be elegant — khussa (traditional Pakistani footwear) or embellished heels pair perfectly with formal suits. Ensure your shoes are broken in before the event, as Pakistani weddings involve hours of standing and celebrating.

## Occasions for Formal Wear

**Pakistani Weddings**: Mehndi, barat, and walima functions all call for formal wear, though the level of embellishment may vary by function.

**Engagements**: Formal suits are perfect for engagement ceremonies and ring exchanges.

**Formal Dinners**: High-end formal dinners and gala events in Pakistan.

**Religious Celebrations**: Eid prayers and Eid celebrations when you want to dress your best.

**Anniversary Celebrations**: Milestone celebrations and formal family gatherings.

## Frequently Asked Questions

**What qualifies as formal wear versus party wear in Pakistan?**

Formal wear features heavier embroidery, richer fabrics (silk, pure chiffon), and more substantial embellishments. It''s designed for traditional ceremonies and major celebrations. Party wear is lighter, more contemporary, and suitable for casual celebrations, dinners, and semi-formal events. When in doubt, formal wear is the safer choice for Pakistani weddings.

**What should I wear to a Pakistani wedding as a guest?**

As a wedding guest, opt for formal wear that''s elegant but doesn''t compete with the bride. Avoid pure white or heavily bridal colors like deep red. Our formal wear collection offers guest-appropriate options in beautiful colors like teal, magenta, royal blue, and gold. Check with the hosts about color preferences before selecting.

**How heavily embroidered should formal wear be?**

For barat (main wedding ceremony), choose heavily embroidered pieces. For mehndi, moderate embroidery works well. For walima (reception), elegant embroidery with a refined finish is perfect. Our product descriptions specify embroidery levels and best-suited occasions for each piece.

**Can I re-wear formal suits to multiple events?**

Absolutely! Quality formal wear is an investment meant to be worn multiple times. With proper care and storage, our formal suits maintain their beauty for years. Vary your jewelry and dupatta draping style to create fresh looks. Many customers wear the same formal suit to different weddings months apart without issue.

**Do formal wear pieces come with all necessary components?**

Yes, our formal wear ensembles come complete with kameez, shalwar/trousers, and dupatta. Everything you need is included — no additional shopping required. Some pieces may also include accessories like embroidered belts or scarves as part of the set.'
WHERE slug = 'formal-wear';
```

---

### 3. UPDATE /ladies/party-wear/

```sql
UPDATE categories 
SET 
  seo_title = 'Ladies Party Wear Pakistan | Semi-Formal Suits | Habiba Minhas',
  seo_desc = 'Shop ladies party wear for Pakistani celebrations. Semi-formal suits perfect for dinners, Eid dawat & gatherings. Lighter embroidery, contemporary designs. Made in Karachi.',
  description = '# Ladies Party Wear Pakistan

Our party wear collection bridges the gap between casual and formal — perfect for celebrations that call for elegance without the weight of heavily embroidered formal wear. These versatile pieces work beautifully for dinner parties, Eid dawat, birthday celebrations, and family gatherings across Pakistan.

## Party Wear vs Formal Wear: Understanding the Difference

Party wear sits in the sweet spot of Pakistani fashion — more elevated than everyday wear but less ornate than formal wedding attire. The embroidery is present but lighter, the fabrics are comfortable yet luxurious, and the overall look is polished without being overly traditional.

While formal wear demands heavy embellishments and traditional silhouettes, party wear embraces contemporary cuts, trendy colors, and lighter embroidery that won''t weigh you down during long celebrations. You can dance, eat, and socialize comfortably in party wear — something not always possible in heavily embroidered formal pieces.

## When to Choose Party Wear

**Eid Dawat**: Post-Eid celebration dinners where you want to look festive without full formal wear.

**Birthday Parties**: Both hosting and attending birthday celebrations for adults and milestone events.

**Dinner Parties**: Evening dinners at restaurants or homes where casual wear feels too informal but formal wear is excessive.

**Family Gatherings**: Extended family get-togethers, anniversary celebrations, and reunion dinners.

**Semi-Formal Office Events**: Corporate dinners, office parties, and professional celebrations.

**Mehndi Functions (Casual)**: Daytime mehndi events for distant relatives or friends where lighter attire is appropriate.

## Design Elements That Define Party Wear

**Lighter Embroidery**: Elegant threadwork or embellishments that add interest without overwhelming the piece. Think delicate neckline embroidery or border work rather than all-over coverage.

**Contemporary Cuts**: Modern silhouettes alongside traditional designs. Straight cuts, A-line kameez, and trendy necklines that feel current.

**Trendy Colors**: While formal wear often features traditional reds and golds, party wear embraces contemporary palettes — pastels, jewel tones, and modern color combinations.

**Comfortable Fabrics**: Breathable materials like lawn, cotton silk, and light chiffon that work for both day and evening events. Less focus on heavy silks and brocades.

**Versatile Styling**: Pieces that can be dressed up or down depending on accessories and dupatta draping.

## Styling Your Party Wear

Party wear''s versatility means you can style it multiple ways. For a polished look, pair with statement earrings and sleek heels. For casual gatherings, opt for simple jewelry and comfortable flats or khussa.

The dupatta in party wear can be draped casually over one shoulder or styled more formally depending on the event. For dinner parties, a single-shoulder drape feels contemporary. For family gatherings, traditional double-shoulder draping maintains cultural respect.

Keep makeup fresh and modern with party wear — dewy skin, defined eyes, and a bold lip color work beautifully. Unlike formal wear that pairs with traditional makeup, party wear allows for more experimental beauty looks.

## Fabric Choices for Party Wear

Our party wear collection features fabrics that balance elegance and comfort:

**Lawn**: Perfect for daytime events and summer celebrations. Lightweight and breathable.

**Cotton Silk**: Slight sheen with comfortable wear. Works for both day and evening.

**Light Chiffon**: Flowy and elegant without the weight of formal chiffon pieces.

**Georgette**: Soft drape, perfect for contemporary cuts and modern styling.

## Frequently Asked Questions

**What''s the difference between party wear and formal wear?**

Party wear features lighter embroidery, contemporary cuts, and comfortable fabrics — perfect for celebrations like dinners and Eid dawat. Formal wear has heavier embellishments, traditional silhouettes, and rich fabrics designed for weddings and major ceremonies. Party wear is more versatile and can be worn to a wider range of events.

**Can I wear party wear to weddings?**

For distant relatives'' weddings or daytime mehndi functions, party wear works perfectly. For close family weddings or main ceremonies (barat, walima), formal wear is more appropriate. Consider your relationship to the hosts and the specific function when deciding.

**Are party wear suits reusable for multiple occasions?**

Absolutely! Party wear''s versatility makes it highly reusable. The lighter embroidery and contemporary styling mean you can wear the same piece to different types of events without it being immediately recognizable. Change your accessories, dupatta style, and makeup to create fresh looks.

**Can I dress down party wear for more casual events?**

Yes! That''s one of party wear''s greatest advantages. Pair with minimal jewelry and comfortable footwear for casual family gatherings. Add statement accessories and heels for more formal dinner parties. The same piece adapts to different occasions.

**How do I know if an event requires formal wear or party wear?**

When the invitation specifies "formal attire" or it''s a wedding ceremony, choose formal wear. For events described as "celebration," "dinner," or "gathering," party wear is perfect. If unsure, party wear is the safer bet as it can be dressed up with accessories to match formal events.'
WHERE slug = 'party-wear';
```

---

### 4. UPDATE /ladies/stitched-suits/

```sql
UPDATE categories 
SET 
  seo_title = 'Stitched Suits Pakistan | Ready-to-Wear Ladies Suits | Habiba Minhas',
  seo_desc = 'Buy ready-to-wear stitched suits in Pakistan. No tailoring needed - perfect fit, professional stitching, immediate delivery. Standard Pakistani sizes. Shop stitched formal wear online.',
  description = '# Ready-to-Wear Stitched Suits Pakistan

Our stitched suits collection eliminates the wait and uncertainty of tailoring. Each piece arrives ready to wear in standard Pakistani sizes, professionally stitched with quality finishing that matches custom tailoring. Perfect for customers who need immediate delivery or prefer the convenience of ready-made formal wear.

## The Advantage of Stitched Suits

**Immediate Availability**: No waiting 2-3 weeks for tailoring. Order today, wear within days.

**Professional Stitching**: Our experienced tailors handle every piece, ensuring consistent quality and proper finishing.

**Tried and True Sizing**: Standard Pakistani sizes mean you know your fit. Size charts eliminate guesswork.

**Quality Control**: Every stitched suit passes through quality checks before shipping. We verify seam strength, embroidery placement, and overall finishing.

**Price Transparency**: What you see is what you pay. No hidden tailoring costs or last-minute sizing charges.

**Perfect for Urgent Events**: Last-minute wedding invitations or unexpected celebrations? Stitched suits ship immediately.

## Understanding Stitched vs Unstitched

**Stitched Suits** (Ready-to-Wear):
- Pre-sewn in standard sizes
- Immediate delivery
- Professional tailoring included
- Consistent sizing across all pieces
- Ideal for: Urgent needs, standard sizing, convenience

**Unstitched Suits** (Fabric Only):
- Fabric with no stitching
- Requires local tailor
- Custom measurements possible
- 2-3 week tailoring time
- Ideal for: Custom fit, specific styling, unique sizing needs

For most customers with standard sizing needs, stitched suits offer convenience without compromising quality or fit.

## Sizing & Fit for Stitched Suits

Our stitched suits come in Pakistani standard sizes:

**XS**: Fits UK 6 / Bust 32-34 inches  
**S**: Fits UK 8-10 / Bust 34-36 inches  
**M**: Fits UK 12 / Bust 36-38 inches  
**L**: Fits UK 14 / Bust 38-40 inches  
**XL**: Fits UK 16 / Bust 40-42 inches  

All kameez (shirts) feature a standard 112cm length, following traditional Pakistani formal wear proportions. Shalwar and trousers are tailored to complement the kameez length.

Detailed size charts appear on every product page, including bust, waist, hip, and length measurements. We recommend measuring your best-fitting Pakistani suit and comparing to our charts for perfect sizing.

## Quality Assurance & Finishing

Every stitched suit undergoes rigorous quality control:

**Professional Stitching**: Experienced tailors with years of Pakistani formal wear expertise handle each piece.

**Seam Strength**: Double-stitched seams on stress points ensure durability and long wear.

**Embroidery Placement**: Hand-embroidered elements are positioned correctly for balanced design.

**Finishing Details**: Clean hems, proper button placement, secure closures, and neat thread trimming.

**Fabric Inspection**: We check for fabric flaws before cutting and stitching begins.

**Pre-Delivery Check**: Final inspection before packaging ensures only perfect pieces ship.

## Alteration Services

While our stitched suits are designed for standard sizing, minor alterations are possible:

**Hemming**: Shorten kameez or trouser length at a local tailor if needed.

**Taking In**: Side seams can be taken in for a more fitted look.

**Letting Out**: Limited letting out possible if seam allowance permits (check with us first).

**Sleeve Adjustments**: Sleeves can be shortened or adjusted for length.

For extensive alterations or custom sizing needs, consider our unstitched options or contact us for bulk custom orders (5+ pieces).

## Frequently Asked Questions

**What sizes do stitched suits come in?**

We offer XS, S, M, L, and XL in standard Pakistani sizing. Detailed measurements for bust, waist, hip, and length are provided on each product page. Our sizing follows Pakistani ready-to-wear standards, which tend to run slightly fitted compared to Western sizing.

**Can I get alterations on stitched suits?**

Yes! Minor alterations like hemming or taking in are easily done at any local tailor. Major alterations (letting out, lengthening) may be limited by available seam allowance. We recommend checking measurements carefully before ordering to minimize alteration needs.

**How does the fit compare to custom tailoring?**

Our stitched suits are professionally tailored to standard Pakistani proportions. For customers with standard sizing (matching our size chart measurements), the fit rivals custom tailoring. Those with non-standard proportions or very specific fit preferences may prefer unstitched fabric for custom tailoring.

**Do stitched suits include the dupatta?**

Yes! All our 3-piece stitched suits include the complete set: kameez (stitched), shalwar/trousers (stitched), and dupatta. The dupatta typically comes unstitched or with minimal finishing, allowing you to customize the border treatment if desired.

**How quickly can I receive a stitched suit?**

Stitched suits ship immediately upon order. Within Pakistan, expect delivery in 3-5 business days (standard shipping) or 1-2 days (express shipping to Karachi, Lahore, Islamabad). International orders ship via DHL and typically arrive within 5-8 business days.

**Can I return or exchange if the size doesn''t fit?**

Absolutely! We offer free size exchanges within 14 days of delivery. The suit must be unworn with original tags attached. Simply request an exchange through your account, and we''ll arrange free pickup and ship your new size at no additional cost.'
WHERE slug = 'stitched-suits';
```

---

### 5. UPDATE /kids/3-4-years/

```sql
UPDATE categories 
SET 
  seo_title = 'Kids Festive Wear Ages 3-4 | Toddler Formal Dress Pakistan | Habiba Minhas',
  seo_desc = 'Festive wear for 3-4 year olds in Pakistan. Comfortable, breathable kids formal wear for Eid & weddings. Safe embroidery, easy to wear. Shop toddler party dresses online.',
  description = '# Kids Festive Wear Ages 3-4 Years

Our 3-4 years festive wear collection is specifically designed for active toddlers who need to look elegant while remaining comfortable during long celebrations. Each piece balances traditional Pakistani aesthetics with practical design elements that work for young children.

## Age-Appropriate Design for Toddlers

At ages 3-4, children are active, playful, and not always patient with fancy clothing. Our designs acknowledge this reality while maintaining the beauty Pakistani formal wear demands.

**Easy On, Easy Off**: Simple closures and wide necklines mean less struggle during dressing time. No complicated ties or small buttons that frustrate toddlers.

**Room for Movement**: Cuts are slightly looser than adult proportions, allowing toddlers to run, play, and sit comfortably during long wedding functions.

**Soft Inner Linings**: We line embroidered areas to prevent scratching or irritation against sensitive toddler skin.

**Lightweight Construction**: Heavy embroidery is concentrated on visible areas (front, neckline) while backs and sides stay light for comfort.

## Safe Materials & Construction

Safety is paramount for toddler clothing:

**Breathable Fabrics**: Cotton, lawn, and light cotton-silk blends that won''t overheat during outdoor events.

**Secure Embellishments**: All sequins, beads, and embroidery threads are double-stitched to prevent detachment. We avoid small loose elements that pose choking hazards.

**Non-Irritating Materials**: Soft fabrics that won''t cause rashes or discomfort. We avoid scratchy embroidery threads against skin.

**Tested Fastenings**: Buttons and closures are securely attached and larger than standard to prevent accidental swallowing.

**Flame-Resistant Fabrics**: Natural fibers that meet safety standards for children''s clothing.

## Perfect for First Celebrations

Ages 3-4 represent many first formal events for Pakistani children:

**First Big Eid**: These ages often mark the first time children are old enough to participate fully in Eid celebrations and family photos.

**Family Weddings**: Toddlers at this age can walk down the aisle, participate in ceremonies, and appear in family pictures.

**Birthday Parties**: Formal birthday celebrations where traditional wear is requested.

**Cultural Events**: Mehndi functions, engagement parties, and family milestones.

Our designs photograph beautifully while allowing children to enjoy themselves rather than complaining about uncomfortable clothing.

## Sizing for Ages 3-4

Toddler sizing can be tricky. Our 3-4 years category generally fits:

**Age 3 Years**: Height 95-100cm, Weight 14-16kg  
**Age 4 Years**: Height 100-110cm, Weight 16-18kg

We recommend checking your child''s current height against our size chart rather than relying solely on age. Children grow at different rates, and height is the most reliable indicator for proper fit.

When between sizes, size up. Children this age grow quickly, and slight extra length ensures they can wear the outfit multiple times before outgrowing it.

## Design Styles for 3-4 Years

**Girls**:
- Short frocks with leggings (comfortable for active play)
- Simple anarkali cuts (twirly and fun for toddlers)
- Co-ord sets (top and bottom separately, easy dressing)
- Soft ghararas with short kameez (traditional yet practical)

**Boys** (if applicable):
- Kurta shalwar sets with elastic waists
- Short kurtas with churidar bottoms
- Waistcoat sets over simple kurtas

All styles feature age-appropriate embroidery — enough to look festive but not so heavy that it''s uncomfortable.

## Care & Maintenance

Toddler clothing needs frequent washing:

**Machine Washable**: Most of our 3-4 years collection can be gently machine washed. Check care labels on each piece.

**Hand Wash Recommended**: For heavily embroidered pieces, hand washing in cold water preserves the embroidery.

**Stain Treatment**: Accidents happen with toddlers. Most stains (food, dirt) come out with gentle stain removers before washing.

**Quick Dry**: Lightweight fabrics dry quickly, important when you need to wash between wearing.

**Easy Iron**: Natural fabrics iron smoothly, and most wrinkles fall out with steam.

## Frequently Asked Questions

**What size is best for a 3-year-old?**

Measure your child''s height and check our size chart on each product page. Generally, a 3-year-old between 95-100cm will fit our "3 years" size. If your child is tall for their age or the event is several months away, consider sizing up. Pakistani festive wear tends to run true to size with some room for growth.

**Are these outfits comfortable for active toddlers?**

Yes! We design specifically for this age group''s activity level. Soft fabrics, room for movement, and lightweight construction mean children can play, run, and sit on the floor without discomfort. Embroidery is strategically placed to avoid irritation during movement.

**Can they be washed at home or do they need dry cleaning?**

Most pieces in the 3-4 years range are washable at home. For lightly embroidered pieces, machine wash on gentle cycle in cold water. For heavier embroidery, hand wash and air dry. Dry cleaning is rarely necessary for this age group, as we know toddler clothes need frequent washing.

**How many times can my child wear this before outgrowing it?**

With proper sizing, most children can wear festive pieces 2-4 times over 6-8 months before outgrowing. If you size up slightly, you may extend this to a full year. Children grow quickly at this age, so we recommend not buying too far in advance of events.

**Are the embellishments safe (no choking hazards)?**

Absolutely. All sequins, beads, and decorative elements are securely double-stitched. We avoid small detachable pieces that could pose choking risks. Our designs pass safety standards for children''s clothing in Pakistan and internationally.'
WHERE slug = '3-4-years';
```

---

### 6. UPDATE /kids/5-6-years/

```sql
UPDATE categories 
SET 
  seo_title = 'Kids Festive Wear Ages 5-6 | Girls Formal Dresses Pakistan | Habiba Minhas',
  seo_desc = 'Festive wear for 5-6 year olds in Pakistan. Beautiful girls formal dresses for Eid, weddings & parties. Comfortable cuts, quality embroidery. Shop kids party wear online.',
  description = '# Kids Festive Wear Ages 5-6 Years

Our 5-6 years festive wear collection marks a sweet spot in children''s formal clothing — old enough for more elaborate designs, young enough to prioritize comfort and playfulness. These pieces balance elegance with the practical needs of early elementary-age children.

## The 5-6 Age Group: Design Considerations

Children ages 5-6 are developing their own style preferences while still needing practical, comfortable clothing. They''re attending more formal events, participating in wedding ceremonies, and beginning to care about how they look in photos.

**Growing Independence**: Kids this age often dress themselves, so our designs feature easy closures and manageable fastenings they can handle independently.

**Style Awareness**: Five and six-year-olds start having opinions about colors, styles, and embellishments. Our collection offers variety to match different personalities.

**Active Participants**: At this age, children aren''t just attending events — they''re walking in wedding processions, performing at parties, and fully participating. Comfort during extended wear is essential.

**Photo-Ready**: Parents want pictures that last a lifetime. Our designs photograph beautifully while ensuring children look happy and comfortable in photos.

## Design Styles for 5-6 Years

**Embroidered Frocks**: Slightly longer than toddler versions, often knee-length with beautiful neckline embroidery. Perfect for twirling on the dance floor.

**Anarkali Sets**: Flowing silhouettes that feel princess-like to young girls. Comfortable waist construction with room for movement.

**Co-ord Sets**: Matching top and bottom pieces that can be mixed with other items later, extending wear value.

**Gharara Sets**: Traditional Pakistani style with wide-leg bottoms and shorter kameez, perfect for formal wedding functions.

**Silk Suits**: Lighter weight than adult versions, featuring just enough embroidery to feel special without overwhelming small frames.

## Fabric Choices for This Age

**Cotton Silk**: Slight sheen with breathable comfort. Works for both day and evening events.

**Lawn**: Perfect for summer Eid and daytime celebrations. Lightweight and easy to wash.

**Soft Georgette**: Flowy fabric that creates beautiful movement without weight.

**Light Chiffon**: Used sparingly for dupattas and overlays, adds elegance without discomfort.

All fabrics are chosen for their softness against skin, breathability during long events, and ease of care for parents.

## Sizing for Ages 5-6

**Age 5 Years**: Height 110-115cm, Weight 18-21kg  
**Age 6 Years**: Height 115-120cm, Weight 20-23kg

Children this age show more variation in height and build. Always measure current height and compare to our detailed size charts. When ordering for an event several months away, consider sizing up to account for growth.

Our 5-6 years pieces are designed with slight extra length that can be hemmed if needed, allowing for growth spurts between purchase and wearing.

## Occasions Perfect for This Age Group

**Eid Celebrations**: First or second Eid where children fully understand and enjoy the celebration. Our festive wear makes them feel special for prayers and family visits.

**Wedding Functions**: Old enough to be flower girls, participate in ceremonies, and enjoy the full event. Needs formal wear that lasts through multi-hour functions.

**Birthday Parties**: Formal birthday celebrations, both hosting and attending.

**School Events**: Cultural days, annual functions, and formal school celebrations where traditional Pakistani wear is requested.

**Family Photographs**: Extended family photo sessions, milestone celebrations, and special occasions requiring coordinated formal wear.

## Comfort Features Parents Love

**Elastic Waistbands**: Hidden elastic in shalwar and ghararas means comfortable fit that adjusts slightly as children eat and play during long events.

**Lined Bodices**: Inner linings prevent embroidery from scratching or irritating skin during extended wear.

**Easy Wash**: Most pieces tolerate hand washing or gentle machine wash, crucial for the inevitable spills and stains.

**Quality Construction**: Double-stitched seams withstand the wear and tear of active children.

**Adjustable Elements**: Some designs feature adjustable ties or gathering that accommodate minor size variations.

## Care Instructions

**Regular Washing**: This age group can be messy. Most pieces hand wash beautifully in cold water with mild detergent.

**Stain Treatment**: Treat stains immediately after events for best results. Most food stains release with gentle stain removers.

**Air Dry**: Hang or lay flat to dry. Avoid direct sunlight on embroidered areas to preserve color.

**Steam Iron**: Light steaming removes wrinkles without risk of iron marks on embellishments.

**Storage**: Store in breathable garment bags between wears to prevent dust and maintain freshness.

## Frequently Asked Questions

**What size should I choose for a tall 5-year-old?**

Height is more important than age for sizing. Measure your child''s height and check our size chart. If your child is 115cm or taller at age 5, consider the 6-year size or check measurements carefully. We provide exact measurements for each piece on the product page.

**Are these comfortable enough for a 4-5 hour wedding?**

Yes! We design specifically for Pakistani events which often run many hours. Soft fabrics, breathable construction, and practical cuts mean children can sit, stand, dance, and play throughout extended celebrations without discomfort or overheating.

**Can my daughter play in this or will the embroidery be damaged?**

Our embroidery is securely stitched to withstand normal play. While we don''t recommend rough outdoor play in formal wear, children can move freely, dance, and participate in normal event activities without damaging the embroidery. The quality construction ensures durability.

**Do these come in sets or separate pieces?**

Most of our festive wear comes as complete sets (kameez/frock + bottom + dupatta if applicable). This ensures everything matches and saves you the hassle of coordinating separate pieces. Check individual product descriptions for exact inclusions.

**How far in advance should I order for an event?**

Order 2-4 weeks in advance if possible, allowing time for shipping and any minor alterations needed. If the event is more than 2 months away, consider your child''s growth rate before ordering. For urgent events, we offer express shipping that delivers within 1-2 business days to major cities.'
WHERE slug = '5-6-years';
```

---

### 7. UPDATE /kids/7-8-years/

```sql
UPDATE categories 
SET 
  seo_title = 'Kids Festive Wear Ages 7-8 | Girls Party Dress Pakistan | Habiba Minhas',
  seo_desc = 'Festive wear for 7-8 year olds in Pakistan. Elegant girls party dresses & formal wear for weddings, Eid & celebrations. Quality Pakistani kids fashion. Shop online.',
  description = '# Kids Festive Wear Ages 7-8 Years

Our 7-8 years festive wear collection caters to pre-teens who are developing stronger style preferences while still enjoying the playfulness of childhood. These pieces offer more sophisticated designs than younger categories while maintaining the comfort and durability active children need.

## Designing for Pre-Teens

Ages 7-8 represent a transition in children''s formal wear. Kids this age often have strong opinions about what they wear, care about matching their friends or cousins, and want to look "grown up" while remaining age-appropriate.

**Style Consciousness**: Children this age notice fashion details, prefer certain colors, and may request specific styles they''ve seen on others.

**Comfort Remains Key**: Despite wanting to look elegant, they still need clothing that doesn''t restrict play, eating, or movement during long events.

**Photo Awareness**: Kids at this age know they''re being photographed and want to look their best, making well-fitting, flattering cuts important.

**Growing Independence**: Complete self-dressing is expected, so designs must be manageable without adult help.

## Design Sophistication for This Age

**More Elaborate Embroidery**: Compared to younger ages, 7-8 year pieces can feature more detailed embroidery work without overwhelming the child''s frame.

**Longer Lengths**: Frocks and kameez hit closer to the knee or below, reflecting more formal proportions while remaining age-appropriate.

**Traditional Silhouettes**: Anarkalis, ghararas, and formal suit sets that mirror adult styles in kid-friendly proportions.

**Detail Work**: Neckline embroidery, border work, and embellished dupattas add sophistication suitable for this age.

**Color Variety**: From pastels to jewel tones, our range accommodates different preferences and event formality levels.

## Popular Styles for 7-8 Years

**Anarkali Suits**: Flowing floor-length styles with fitted bodices and flared bottoms. Kids love the princess-like silhouette.

**Gharara Sets**: Traditional Pakistani style becoming increasingly popular for this age group. Wide-leg ghararas paired with medium-length kameez.

**Formal Frocks**: Knee-length to calf-length dresses with embroidered bodices and flowing skirts. Perfect for twirling.

**3-Piece Suits**: Complete traditional sets (kameez, shalwar, dupatta) that mirror adult formal wear in child proportions.

**Co-ord Sets**: Modern matching separates that offer versatility and extended wear value.

## Sizing for Ages 7-8

**Age 7 Years**: Height 120-125cm, Weight 22-26kg  
**Age 8 Years**: Height 125-132cm, Weight 25-30kg

Pre-teens show significant variation in height and build. Some 8-year-olds are nearly as tall as petite adults, while others remain smaller. Always check height measurements rather than assuming age-based sizing.

Our 7-8 years range is designed to fit this broad spectrum, with adjustable elements where possible to accommodate different builds.

## Events Perfect for This Age Group

**Wedding Ceremonies**: Old enough to have responsibilities (flower girl, junior bridesmaid) or participate fully in ceremonies.

**Eid Celebrations**: These ages fully appreciate and enjoy Eid festivities, from prayers to family visits.

**Formal Birthday Parties**: Both hosting and attending birthday celebrations where traditional wear is requested.

**Cultural Events**: School cultural days, annual day performances, traditional celebrations.

**Family Milestones**: Anniversary parties, engagement ceremonies, formal family gatherings.

**Religious Functions**: Quran completions, religious celebrations, and mosque events.

## Quality & Durability

Kids ages 7-8 are active and can be hard on clothing. Our pieces are built to last:

**Reinforced Seams**: Stress points like armholes, waist, and hems are double-stitched for durability.

**Quality Embroidery**: Secure threadwork that won''t unravel or snag during normal wear.

**Washable Fabrics**: Most pieces tolerate regular washing without losing shape or color.

**Fade-Resistant Colors**: Dyes that maintain vibrancy through multiple wears and washes.

**Strong Closures**: Buttons, hooks, and zippers designed for repeated use by children.

## Matching with Siblings

Many families with multiple children want coordinated looks for events. Our collection makes sibling matching easy:

**Color Coordination**: Available styles in matching color palettes across different age categories.

**Similar Design Elements**: Shared embroidery motifs or design styles that coordinate without being identical.

**Complementary Styles**: Mix and match pieces from different age groups for a cohesive family look.

Contact us for help coordinating multiple pieces for siblings — we''re happy to suggest combinations that work beautifully together.

## Care & Maintenance

**Washing**: Hand wash in cold water for embroidered pieces. Light cotton pieces tolerate gentle machine wash.

**Drying**: Air dry away from direct sunlight to preserve colors and embroidery.

**Ironing**: Iron on low to medium heat, avoiding direct contact with embroidery. Steam works best.

**Storage**: Store in breathable garment bags to prevent dust and yellowing between wears.

**Stain Removal**: Treat stains promptly for best results. Most food and dirt stains release with gentle pre-treatment.

## Frequently Asked Questions

**What if my 8-year-old is very tall?**

Check the specific measurements on each product page. If your child''s height exceeds 132cm, consider looking at our adult XS sizes or contact us for guidance. We can help you find pieces that work for taller children while remaining age-appropriate in style.

**Can these be altered for a better fit?**

Yes! Most pieces can be hemmed, taken in at the waist, or adjusted for length at any local tailor. We recommend ordering based on the largest measurement (usually height) and altering other areas as needed for a perfect fit.

**Are dupattas included for this age?**

Most 3-piece suits include dupattas. For younger ages (7-8), dupattas are often optional and may be styled simply over one shoulder or draped traditionally for photos. Check individual product descriptions for exact inclusions.

**How do I choose between different embroidery levels?**

For daytime events and casual celebrations, lighter embroidery works beautifully and is more comfortable. For evening weddings and formal functions, heavier embroidery photographs better and feels more festive. Consider the event time, formality level, and your child''s comfort with embellished clothing.

**Can my child play outside in this?**

While our festive wear is durable, we don''t recommend outdoor play in formal pieces. For events with outdoor components (garden weddings, lawn parties), choose lighter embroidery and darker colors that hide minor dirt. Save the heavily embroidered white and pastel pieces for indoor events.'
WHERE slug = '7-8-years';
```

---

### 8. UPDATE /kids/girls-formal/

```sql
UPDATE categories 
SET 
  seo_title = 'Girls Formal Wear Pakistan | Kids Wedding Dress & Party Outfits | Habiba Minhas',
  seo_desc = 'Shop girls formal wear for Pakistani weddings & celebrations. Embroidered gowns, festive sets, party dresses for ages 2-12. Handcrafted kids formalwear made in Karachi.',
  description = '# Girls Formal Wear Pakistan

Our complete girls formal wear collection spans ages 2-12, offering handcrafted pieces for every significant childhood celebration. From toddlers attending their first Eid to pre-teens participating in wedding ceremonies, each design balances traditional Pakistani aesthetics with practical wearability for active children.

## Complete Formal Wear Collection for All Ages

**Ages 2-4**: Comfortable, lightweight pieces with soft fabrics and safe construction. Easy to wear, easy to wash, perfect for toddler energy levels.

**Ages 5-7**: Transitional designs featuring more embroidery and traditional silhouettes while maintaining comfort and playfulness.

**Ages 8-10**: Pre-teen styles with sophisticated embroidery, longer lengths, and designs that mirror adult formal wear in age-appropriate proportions.

**Ages 11-12**: Junior sizes bridging children''s and adult fashion, offering elegant formal wear for older children.

## Types of Formal Wear in Our Collection

**Embroidered Gowns**: Floor-length or knee-length dresses with beautiful embroidery work. Perfect for flower girls and junior bridesmaids at Pakistani weddings.

**Festive Co-ord Sets**: Matching two-piece ensembles (top and bottom) that can be mixed with other pieces for extended wear value.

**Silk Suits**: Traditional 3-piece sets (kameez, shalwar, dupatta) in child-friendly weights and proportions. The classic choice for Eid and formal family functions.

**Anarkali Sets**: Flowing silhouettes with fitted bodices and flared bottoms. Universally flattering and comfortable for long events.

**Gharara Sets**: Traditional wide-leg bottoms paired with embroidered kameez. Growing in popularity for Pakistani wedding functions.

**Party Dresses**: Semi-formal pieces suitable for birthday celebrations, dinners, and casual festive events.

## Occasions for Girls Formal Wear

**Pakistani Weddings**: The most common occasion for children''s formal wear. Our pieces work for all wedding functions:
- **Mehndi**: Colorful, comfortable pieces in traditional festive colors
- **Barat**: Heavily embroidered formal wear for the main ceremony
- **Walima**: Elegant, refined pieces for the reception

**Eid Celebrations**: Both Eid ul-Fitr and Eid ul-Adha call for special outfits. Our collection offers Eid-appropriate designs that photograph beautifully and withstand a full day of prayers, family visits, and celebrations.

**Birthday Parties**: Formal birthday celebrations, milestone events, and themed parties where traditional Pakistani wear is requested.

**Cultural Events**: School cultural days, annual day performances, Pakistan Day celebrations, and traditional event participation.

**Family Milestones**: Engagements, anniversary celebrations, Quran completions, and formal family gatherings.

## What Makes Formal Wear "Formal" for Kids

Pakistani formal wear for children shares characteristics with adult formal pieces while being adapted for practical childhood needs:

**Embroidery & Embellishments**: Hand-embroidered details, sequin work, beading, and threadwork that add elegance. Heavier than everyday wear, lighter than might appear to ensure comfort.

**Premium Fabrics**: Silk, chiffon, georgette, and fine cotton rather than everyday lawn or basic cotton.

**Traditional Cuts**: Anarkalis, ghararas, and 3-piece suits that honor Pakistani formal wear traditions.

**Complete Ensembles**: Full sets with all components (kameez, bottom, dupatta) rather than separates.

**Detailed Finishing**: Quality stitching, proper linings, and refined construction details.

## Sizing Across Age Groups

Each age category in our girls formal wear collection has specific sizing:

**2-3 Years**: 90-100cm height  
**3-4 Years**: 100-110cm height  
**5-6 Years**: 110-120cm height  
**7-8 Years**: 120-132cm height  
**9-10 Years**: 130-145cm height  
**11-12 Years**: 145-155cm height

Always check the detailed size chart on individual product pages. Height is the most reliable measurement for kids'' clothing. When ordering for events several months away, consider your child''s growth rate.

## Styling Tips for Parents

**Accessories**: Keep jewelry simple and age-appropriate. Small earrings or a delicate necklace is enough. Avoid heavy jewelry that overwhelms children''s frames.

**Footwear**: Traditional khussa, ballet flats, or simple sandals work best. Ensure shoes are broken in before the event to prevent discomfort.

**Hair Styling**: Simple braids, soft curls, or neat ponytails photograph beautifully without requiring hours in a salon chair.

**Dupatta Draping**: For younger children (under 7), dupattas are optional and may be removed after photos. For older children, a simple over-one-shoulder drape works well.

## Care Instructions

**Washing**: Hand wash embroidered pieces in cold water with mild detergent. Light cotton pieces may tolerate gentle machine wash.

**Stain Treatment**: Children''s formal wear often encounters food and drink spills. Treat stains immediately after events for best results.

**Drying**: Air dry away from direct sunlight to preserve colors and embroidery integrity.

**Storage**: Store in breathable garment bags between wears. Avoid plastic dry-cleaning bags which trap moisture.

**Ironing**: Steam iron on low to medium heat. Avoid direct iron contact with embroidery.

## Frequently Asked Questions

**What age range is girls formal wear for?**

Our girls formal wear collection spans ages 2-12 years. We offer specific age categories (3-4 years, 5-6 years, 7-8 years) with appropriate sizing and design sophistication for each age group. For children over 12 or particularly tall 11-12 year olds, check our adult XS sizes.

**How do I choose the right outfit for a wedding?**

Consider the specific function (mehndi, barat, walima) and your relationship to the hosts. For close family, choose heavily embroidered formal pieces. For distant relatives or friends, semi-formal party wear works well. Match the formality level to the event time (evening events are more formal) and consider your child''s comfort during extended celebrations.

**Are these machine washable or dry clean only?**

Most of our girls formal wear pieces with light to moderate embroidery can be hand washed at home in cold water. Heavily embroidered gowns and silk pieces should be dry cleaned. We know children''s clothing needs frequent washing, so we design with home care in mind whenever possible. Always check the specific care label on your piece.

**Do you offer matching sets for siblings or mother-daughter?**

Yes! Many of our collections are available in coordinating colors and styles across different age categories. For mother-daughter matching, check our ladies collection for adult pieces in similar colors and embroidery styles. Contact us for help coordinating multiple family members — we can suggest pieces that work beautifully together.

**How far in advance should I order for an Eid or wedding?**

Order 2-4 weeks in advance for standard shipping within Pakistan. This allows time for delivery and any minor alterations needed at a local tailor. For international orders, allow 3-4 weeks. If ordering for an event more than 2 months away, consider your child''s rapid growth and possibly delay ordering or size up to account for growth.'
WHERE slug = 'girls-formal';
```

---

## IMPLEMENTATION INSTRUCTIONS

### Step 1: Access Supabase Dashboard
1. Log into your Supabase project
2. Go to SQL Editor

### Step 2: Run Each Update Query
- Copy each query above
- Paste into SQL Editor
- Click "Run"
- Verify success message

### Step 3: Verify Updates
After running all 8 queries, verify by checking one page:
1. Visit: https://habibaminhas.com/ladies/3-piece-suits/
2. Check if content expanded
3. View page source to see meta tags

### Step 4: Submit for Re-indexing
1. Go to Google Search Console
2. Submit sitemap
3. Request indexing for these 8 URLs manually

---

## NEXT STEPS

After database updates complete:
- **Phase 5B**: Expand content pages (file-based)
- **Phase 5C**: Add FAQ schema to help pages
- **Phase 5D**: Add noindex to utility pages

---

**Status**: Ready to implement  
**Time Required**: 15-20 minutes to run all queries  
**Expected Result**: 8 pages expand from 60 → 450 words
