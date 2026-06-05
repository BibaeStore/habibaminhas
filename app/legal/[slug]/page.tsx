import { notFound } from "next/navigation";

type Params = { slug: string };

const legal: Record<string, { title: string; body: { h: string; p: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      {
        h: "Introduction",
        p: "At Habiba Minhas, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how Habiba Minhas Clothing (SMC-Private) Limited, company registration number 0338396, registered in Pakistan, collects, uses, stores, and protects your personal data when you visit our website at habibaminhas.com or make purchases from us. By using our website and services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our website.",
      },
      {
        h: "Who We Are",
        p: "Habiba Minhas Clothing (SMC-Private) Limited is a legally registered company in Pakistan (Registration No. 0338396) based in Karachi, Pakistan. We are Pakistan's leading handcrafted fashion brand specializing in premium ladies suits, kids festive wear, and baby products. Our registered business address is Karachi, Pakistan — 75533. For privacy-related inquiries, you can contact us at info@habibaminhas.com or call +92 312 0295812. We operate our e-commerce website at habibaminhas.com and comply with all applicable Pakistani data protection laws and international best practices.",
      },
      {
        h: "Information We Collect",
        p: "We collect several types of information to provide and improve our services to you. Personal identification information includes your full name, email address, phone number, shipping address, and billing address, which you provide when creating an account, placing an order, or contacting customer support. Order information includes details of products purchased, order history, payment method (but never your actual card numbers or CVV codes), transaction amounts, and delivery preferences. We collect technical information automatically through cookies and similar technologies, including your IP address, browser type and version, device type, operating system, pages visited, time spent on pages, referring website addresses, and general location data (city/country level only). We also collect communication data when you contact us via email, phone, WhatsApp, or our contact forms, including the content of your messages and our responses. We never collect sensitive payment card data directly — all payment processing is handled securely by our PCI-DSS certified payment gateway partners.",
      },
      {
        h: "How We Use Your Information",
        p: "We use the personal information we collect for several legitimate business purposes. To fulfill orders and deliver products, we process your shipping address, contact information, and order details to ensure timely delivery across Pakistan. For customer service, we use your contact information and order history to respond to inquiries, process returns and exchanges, resolve complaints, and provide support via email, phone, or WhatsApp. We use your email address to send order confirmations, shipping notifications, delivery updates, and important account information. With your explicit consent only, we may send you our newsletter, promotional offers, and marketing communications about new products and collections — you can unsubscribe at any time by clicking the unsubscribe link in any email or contacting us. We analyze website usage data and analytics to improve our website performance, understand customer preferences, optimize product offerings, and enhance the shopping experience. For security and fraud prevention, we use technical data and order patterns to detect and prevent fraudulent transactions, protect against unauthorized access, and maintain the security of our systems. We also use your information to comply with legal obligations under Pakistani law, respond to lawful requests from government authorities, and enforce our terms and conditions.",
      },
      {
        h: "How We Store and Protect Your Data",
        p: "We take the security of your personal information seriously and implement industry-standard security measures to protect it. Your data is stored on secure servers with encryption both in transit (using SSL/TLS) and at rest. Access to your personal information is restricted to authorized personnel only who need it to perform their job functions. We implement administrative, technical, and physical safeguards including firewalls, secure data centers, regular security audits, and employee training on data protection. We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected: active account data is retained while your account is active; order history is kept for 7 years for accounting and legal compliance purposes; marketing consent records are maintained until you withdraw consent; and technical logs are typically retained for 90 days. When data is no longer needed, it is securely deleted or anonymized. While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
      },
      {
        h: "Sharing Your Information",
        p: "We do not sell, trade, or rent your personal information to third parties. However, we do share your information with trusted service providers who help us operate our business. Shipping and courier partners (such as TCS, Leopards, or M&P Courier) receive your name, phone number, shipping address, and order details solely for delivery purposes. Payment processors handle transaction processing securely — we never see or store your full card details. Email service providers help us send order confirmations, shipping updates, and newsletters (only if you've opted in). Web hosting and cloud storage providers store our website data and customer information securely. Customer support tools may be used to manage and respond to your inquiries efficiently. All third-party service providers are contractually obligated to keep your information secure and use it only for the specific purposes we've hired them for. We may also disclose your information if required by Pakistani law, court order, or government regulation, or if necessary to protect our legal rights, prevent fraud, or ensure the safety of our customers and staff.",
      },
      {
        h: "Your Rights and Choices",
        p: "Under Pakistani law and international best practices, you have several important rights regarding your personal data. You have the right to access your personal information — you can request a copy of all data we hold about you by emailing info@habibaminhas.com. You have the right to correct or update any inaccurate or incomplete information in your account settings or by contacting us. You have the right to delete your account and associated personal data, subject to our legal obligation to retain certain records (such as order history for tax and accounting purposes). You have the right to export your data in a commonly used, machine-readable format. You have the right to object to or restrict certain types of data processing, such as marketing communications. You can withdraw marketing consent at any time by clicking unsubscribe in our emails or contacting us directly. To exercise any of these rights, please contact us at info@habibaminhas.com or call +92 312 0295812. We will respond to all requests within 30 days. You also have the right to lodge a complaint with relevant Pakistani data protection authorities if you believe we have mishandled your personal information.",
      },
      {
        h: "Cookies and Tracking Technologies",
        p: "Our website uses cookies and similar tracking technologies to enhance your browsing experience and analyze website performance. Cookies are small text files stored on your device that help us remember your preferences, keep you logged in, analyze how you use our site, and provide personalized experiences. We use essential cookies that are necessary for the website to function (such as shopping cart and checkout functionality), analytics cookies to understand how visitors use our site (we use privacy-focused analytics that don't track personal information), and functional cookies to remember your preferences like language and region settings. We do not use third-party advertising cookies or sell your browsing data to advertisers. You can control cookie preferences through your browser settings — most browsers allow you to refuse cookies or alert you when cookies are being sent. However, disabling cookies may affect the functionality of certain features on our website, such as the shopping cart or checkout process.",
      },
      {
        h: "Children's Privacy",
        p: "Our website and services are not directed to children under the age of 13 (or the applicable age of digital consent in Pakistan). We do not knowingly collect personal information from children. While we sell children's clothing and baby products, all purchases must be made by adults. If we become aware that we have inadvertently collected personal information from a child under 13 without proper parental consent, we will take steps to delete that information as quickly as possible. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at info@habibaminhas.com so we can take appropriate action.",
      },
      {
        h: "International Data Transfers",
        p: "Your personal information is primarily stored and processed in Pakistan. However, some of our third-party service providers (such as payment gateways, email services, or cloud hosting providers) may be located in other countries. When we transfer data internationally, we ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws. We only work with service providers that maintain adequate security standards and comply with international data protection frameworks.",
      },
      {
        h: "Changes to This Privacy Policy",
        p: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other operational needs. When we make significant changes, we will notify you by posting a prominent notice on our website or sending you an email notification (if you have an account with us). The 'Last Updated' date at the top of this policy indicates when it was last revised. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of our website and services after any changes to this Privacy Policy will constitute your acceptance of such changes.",
      },
      {
        h: "Contact Us",
        p: "If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please don't hesitate to contact us. You can reach us by email at info@habibaminhas.com, by phone or WhatsApp at +92 312 0295812 (Monday-Friday, 10 AM - 6 PM PKT), or by mail at Habiba Minhas Clothing (SMC-Private) Limited, Karachi, Pakistan — 75533. We are committed to addressing your privacy concerns promptly and transparently. Our customer service team typically responds to all inquiries within 24 hours on business days.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      {
        h: "Agreement to Terms",
        p: "Welcome to Habiba Minhas. These Terms of Service ('Terms') constitute a legally binding agreement between you and Habiba Minhas Clothing (SMC-Private) Limited, company registration number 0338396, registered in Pakistan. These Terms govern your access to and use of our website at habibaminhas.com, our mobile applications (if any), and all related services (collectively, the 'Services'). By accessing or using our Services, creating an account, or making a purchase, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you may not use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services after such changes constitutes acceptance of the modified Terms. It is your responsibility to review these Terms periodically.",
      },
      {
        h: "Eligibility and Account Registration",
        p: "To use our Services and make purchases, you must be at least 18 years old or the age of legal majority in Pakistan, and capable of entering into legally binding contracts. By using our Services, you represent and warrant that you meet these eligibility requirements. If you create an account with us, you are responsible for maintaining the confidentiality of your account credentials (username and password) and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate and current. You must notify us immediately of any unauthorized use of your account or any other breach of security by contacting info@habibaminhas.com or calling +92 312 0295812. We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in fraudulent or abusive behavior. You may not use another person's account without permission, and you may not transfer your account to another person without our prior written consent.",
      },
      {
        h: "Products, Pricing, and Availability",
        p: "We strive to display our products and their colors as accurately as possible on our website. However, the actual colors you see will depend on your monitor or device screen, and we cannot guarantee that your display will accurately reflect the true colors of our products. All products are subject to availability, and we reserve the right to limit quantities or discontinue any product at any time without prior notice. We make every effort to ensure that pricing information on our website is accurate. However, errors may occur. All prices are listed in Pakistani Rupees (PKR) and include applicable taxes unless otherwise stated. If we discover a pricing error after you have placed an order, we will notify you as soon as possible and give you the option to either confirm the order at the correct price or cancel the order for a full refund. We reserve the right to refuse or cancel any order placed at an incorrect price, whether or not the order has been confirmed and payment has been processed. Product descriptions, specifications, and images are provided for general information purposes and are based on information provided by manufacturers and suppliers. While we strive for accuracy, we do not warrant that product descriptions or other content on our website is completely accurate, current, or error-free.",
      },
      {
        h: "Orders and Payment",
        p: "When you place an order through our Services, you are making an offer to purchase products at the prices stated. We reserve the right to accept or reject your order for any reason, including product availability, errors in pricing or product information, suspected fraudulent activity, or other reasons at our discretion. Your receipt of an order confirmation email does not constitute our acceptance of your order — it is merely confirmation that we have received it. An order is not considered accepted until we have processed payment and dispatched the products. We accept various payment methods including credit/debit cards (Visa, Mastercard, American Express), mobile wallets (JazzCash, Easypaisa), and Cash on Delivery (COD) for orders within Pakistan up to Rs. 25,000. All card payments are processed through our secure, PCI-DSS certified payment gateway partners. We do not store your complete card information on our servers. For Cash on Delivery orders, payment must be made in Pakistani Rupees upon delivery to the courier. COD orders may be subject to verification calls before dispatch. If payment is declined or fails for any reason, your order may be delayed or cancelled. You are responsible for ensuring that your billing information is accurate and that you have sufficient funds or credit available to complete the purchase.",
      },
      {
        h: "Shipping and Delivery",
        p: "We offer shipping across Pakistan at a flat rate of Rs. 250 nationwide. Express same-day delivery is available in Karachi, Lahore, and Islamabad for an additional Rs. 500 (orders must be placed before 2:00 PM). Standard delivery typically takes 3-5 business days depending on your location. Orders are processed and dispatched within 24 hours on business days (Monday-Saturday). We also offer international shipping to select countries via DHL Express, with rates calculated at checkout based on weight and destination. Delivery times for international orders are typically 5-8 business days. You will receive a tracking number via email once your order has been dispatched, and you can track your order through your account on our website. While we strive to meet estimated delivery times, we are not liable for delays caused by courier services, customs clearance (for international orders), natural disasters, strikes, or other events beyond our reasonable control. Risk of loss and title for products purchased pass to you upon delivery to the shipping address you provided. It is your responsibility to provide a complete and accurate shipping address. We are not responsible for orders delivered to incorrect addresses provided by you or for packages lost due to incorrect address information.",
      },
      {
        h: "Returns, Exchanges, and Refunds",
        p: "We want you to be completely satisfied with your purchase. We accept returns for defective or damaged products only. If you receive an item with manufacturing defects, stitching issues, color discrepancies from the product description, or shipping damage, you must contact us within 7 days of delivery at info@habibaminhas.com or +92 312 0295812. Returns for defective items are free — we will arrange pickup at no cost to you anywhere in Pakistan. We accept exchanges for size, fit, or style preferences within 14 days of delivery. The item must be unworn, unwashed, in its original condition and packaging with all tags attached. Exchange shipping is free within Pakistan. To initiate a return or exchange, log into your account, go to 'My Orders', select the item, and submit a return/exchange request with photos if claiming a defect. Our team will review and respond within 24 hours. Certain items cannot be returned or exchanged: sale items marked 'Final Sale', fragrance products, unstitched fabric once cut to size, intimate wear for hygiene reasons, and custom or made-to-order pieces (unless defective). Refunds for approved returns are processed within 5-7 business days to the original payment method. For COD orders, refunds are issued via bank transfer or mobile wallet. Exchange items ship within 2-3 business days after we receive your return. We reserve the right to refuse returns or exchanges that do not meet our policy requirements or appear to show signs of wear or misuse.",
      },
      {
        h: "Intellectual Property Rights",
        p: "All content on our website and Services, including but not limited to text, graphics, logos, images, product descriptions, photographs, videos, icons, software, designs, and compilations, is the exclusive property of Habiba Minhas Clothing (SMC-Private) Limited or our licensors and is protected by Pakistani and international intellectual property laws, including copyright, trademark, and design rights. Our brand name 'Habiba Minhas', our logo, and all related marks are trademarks or registered trademarks of Habiba Minhas Clothing (SMC-Private) Limited in Pakistan. You may not use, reproduce, copy, modify, distribute, transmit, display, perform, publish, license, create derivative works from, transfer, or sell any content, products, or services obtained from our website without our prior written permission. You are granted a limited, non-exclusive, non-transferable license to access and use our Services for personal, non-commercial purposes only. This license does not include any right to: (a) resell or make commercial use of our Services or content; (b) modify or make derivative works of our Services or content; (c) use data mining, robots, or similar data gathering or extraction methods; (d) download any portion of our Services except as expressly permitted (such as downloading product images for personal reference); or (e) use our Services other than for their intended purpose. Any unauthorized use of our intellectual property may result in legal action and termination of your account.",
      },
      {
        h: "User Conduct and Prohibited Activities",
        p: "When using our Services, you agree to comply with all applicable Pakistani laws and regulations. You agree not to: (a) use our Services for any unlawful purpose or to solicit others to perform unlawful acts; (b) violate any international, federal, provincial, or local laws or regulations; (c) infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) submit false, inaccurate, or misleading information; (e) upload viruses, malware, or any other malicious code that could harm our Services or other users; (f) engage in any automated use of our Services, such as using scripts, bots, or web crawlers; (g) attempt to interfere with, disrupt, or create an undue burden on our Services or networks; (h) attempt to bypass any security measures or access restricted areas of our Services; (i) harass, abuse, or harm other users or our staff; (j) use our Services to transmit spam, chain letters, or unsolicited communications; (k) impersonate another person or entity; or (l) engage in any fraudulent activity including using stolen credit cards or making false chargebacks. We reserve the right to monitor user activity on our Services and to investigate and take appropriate action against users who violate these Terms, including but not limited to account suspension, termination, and reporting to law enforcement authorities.",
      },
      {
        h: "Limitation of Liability",
        p: "To the fullest extent permitted by Pakistani law, Habiba Minhas Clothing (SMC-Private) Limited, its directors, officers, employees, affiliates, agents, and suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from: (a) your access to or use of or inability to access or use our Services; (b) any conduct or content of any third party on our Services; (c) any content obtained from our Services; (d) unauthorized access, use, or alteration of your transmissions or content; or (e) any other matter relating to our Services. This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if we have been advised of the possibility of such damage. Our total liability to you for all claims arising out of or relating to these Terms or our Services shall not exceed the amount you paid to us in the twelve (12) months preceding the event giving rise to liability, or PKR 10,000, whichever is greater. Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so some of the above limitations may not apply to you. In such cases, our liability will be limited to the maximum extent permitted by law.",
      },
      {
        h: "Indemnification",
        p: "You agree to defend, indemnify, and hold harmless Habiba Minhas Clothing (SMC-Private) Limited, its parent, subsidiaries, affiliates, officers, directors, employees, agents, licensors, and suppliers from and against any and all claims, damages, obligations, losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising from: (a) your use of or inability to use our Services; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property, privacy, or publicity rights; (d) any claim that your use of our Services caused damage to a third party; or (e) any content you submit or transmit through our Services. This indemnification obligation will survive the termination of these Terms and your use of our Services. We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with our defense of such claim.",
      },
      {
        h: "Dispute Resolution and Governing Law",
        p: "These Terms and any disputes arising out of or relating to these Terms or our Services shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Any legal action, suit, or proceeding arising out of or relating to these Terms or our Services must be instituted exclusively in the courts of Karachi, Pakistan, and you consent to the personal jurisdiction of such courts. Before filing any formal legal action, you agree to first contact us at info@habibaminhas.com to attempt to resolve the dispute informally. We will work in good faith to resolve any disputes through negotiation and mutual agreement. If a dispute cannot be resolved through informal negotiation within 30 days, either party may pursue formal legal action. You agree to pursue any claims or disputes on an individual basis and not as part of any class or representative action. Some jurisdictions do not allow certain dispute resolution provisions, so some of these provisions may not apply to you.",
      },
      {
        h: "Termination",
        p: "We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason, including but not limited to: (a) breach of these Terms; (b) fraudulent, abusive, or illegal activity; (c) at your request to close your account; or (d) at our discretion for business or operational reasons. Upon termination, your right to use our Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, warranty disclaimers, indemnification obligations, and limitations of liability. You may terminate your account at any time by contacting us at info@habibaminhas.com. Upon termination of your account, we will delete or anonymize your personal information in accordance with our Privacy Policy and data retention obligations, except for information we are required to retain for legal, accounting, or dispute resolution purposes. Outstanding orders placed before termination will be honored and fulfilled according to these Terms.",
      },
      {
        h: "General Provisions",
        p: "These Terms, together with our Privacy Policy and any other legal notices or agreements published by us on our Services, constitute the entire agreement between you and Habiba Minhas Clothing (SMC-Private) Limited regarding your use of our Services. If any provision of these Terms is found to be unlawful, void, or unenforceable by a court of competent jurisdiction, that provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. We may assign our rights and obligations under these Terms to any party at any time without notice to you. You may not assign or transfer these Terms or your account without our prior written consent. Section headings in these Terms are for convenience only and have no legal or contractual effect. No agency, partnership, joint venture, employment, or franchise relationship is created by these Terms. These Terms do not confer any third-party beneficiary rights.",
      },
      {
        h: "Contact Information",
        p: "If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us at: Habiba Minhas Clothing (SMC-Private) Limited, Email: info@habibaminhas.com, Phone/WhatsApp: +92 312 0295812 (Monday-Friday, 10 AM - 6 PM PKT), Address: Karachi, Pakistan — 75533. We are committed to addressing your concerns promptly and transparently. Our customer service team responds to all inquiries within 24 hours on business days. Thank you for shopping with Habiba Minhas.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(legal).map((slug) => ({ slug }));
}

// SEO-optimized metadata for legal pages
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = legal[slug];

  // Pakistan-optimized SEO for legal pages
  const seoMetadata: Record<string, { title: string; description: string; keywords: string }> = {
    privacy: {
      title: "Privacy Policy — Habiba Minhas Pakistan | Data Protection",
      description: "Privacy policy for Habiba Minhas Pakistan. How we collect, use & protect your personal data. GDPR-compliant privacy practices for Pakistani customers. Registered in Karachi, Pakistan.",
      keywords: "privacy policy Pakistan, data protection Pakistan, Habiba Minhas privacy, Pakistan privacy policy, customer data protection",
    },
    terms: {
      title: "Terms of Service — Habiba Minhas Pakistan | Terms & Conditions",
      description: "Terms and conditions for shopping at Habiba Minhas Pakistan. Your rights, our policies, and legal terms governing online purchases in Pakistan. Governed by laws of Pakistan.",
      keywords: "terms of service Pakistan, terms and conditions Pakistan, online shopping terms Pakistan, Habiba Minhas terms, Pakistan e-commerce terms",
    },
  };

  const seo = seoMetadata[slug] || {
    title: page?.title ?? "Legal",
    description: page?.body[0]?.p ?? "Legal information for Habiba Minhas Pakistan",
    keywords: "",
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/legal/${slug}/`,
    },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = legal[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-16 sm:px-8">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold-dark">
        Legal
      </span>
      <h1 className="mt-3 font-display text-5xl italic leading-tight">
        {page.title}
      </h1>
      <div className="mt-10 flex flex-col gap-8">
        {page.body.map((b) => (
          <section key={b.h}>
            <h2 className="font-display text-2xl italic">{b.h}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              {b.p}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
