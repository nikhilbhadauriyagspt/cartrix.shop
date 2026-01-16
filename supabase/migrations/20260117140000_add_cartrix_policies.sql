-- Migration to add full policies for Cartrix.shop
-- Website ID: df707bc1-f8fd-44fc-856b-fa6bb12f41a7

-- 1. Terms and Conditions
INSERT INTO policies (policy_type, title, content, slug, is_active, website_id)
VALUES (
  'terms',
  'Terms and Conditions – Cartrix',
  '<p>These Terms and Conditions ("Terms") govern your access to and use of the <strong>Cartrix</strong> website (http://cartrix.shop/) and the purchase of products and services from Cartrix ("Cartrix," "we," "us," or "our"). The website is operated by <strong>Prime Fix Solutions LLC</strong>.</p><p>By accessing the Website or placing an order, you agree to be bound by these Terms. Please read them carefully before using our Website or purchasing any products or services.</p><p><br></p><h2>1. Product Information</h2><p>We strive to provide accurate, current, and complete information regarding our products and services, including descriptions, pricing, images, and availability. However, we do not guarantee that all information on the Website is accurate, complete, or error-free.</p><p>Cartrix reserves the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.</p><p><br></p><h2>2. Orders and Payments</h2><p>By placing an order through our Website, you agree to pay the listed price for the selected products or services, including applicable taxes and shipping fees.</p><p>All orders are subject to acceptance and availability. Cartrix reserves the right to refuse, cancel, or limit any order at our discretion, including but not limited to cases of product unavailability, pricing errors, or suspected fraudulent or unauthorized activity.</p><p>Payments must be completed using the payment methods available on the Website. We use secure third-party payment processors (such as PayPal) to handle transactions. Cartrix does not store your payment details and is not responsible for unauthorized access or security breaches beyond our reasonable control.</p><p><br></p><h2>3. Shipping and Delivery</h2><p>We aim to process and ship orders within <strong>5–7 business days</strong>. Delivery timelines may vary depending on location, product availability, and the shipping method selected.</p><p>Cartrix is not responsible for delays, losses, or damages caused by shipping carriers, incorrect shipping information provided by the customer, or events beyond our reasonable control.</p><p><br></p><h2>4. Returns and Refunds</h2><p>Customer satisfaction is important to us. If you are not satisfied with your purchase, you may request a return or exchange within <strong>5–7 business days</strong> of delivery, subject to our Return &amp; Refund Policy.</p><p>Returned items must be unused, in original condition, and in original packaging, including all accessories, manuals, and tags. Cartrix reserves the right to refuse returns that do not meet these requirements.</p><p>Custom or personalized products may not be eligible for return or refund unless they arrive damaged or defective.</p><p><br></p><h2>5. Intellectual Property</h2><p>All content on the Website, including but not limited to text, images, graphics, logos, designs, videos, and software, is the property of Cartrix or its licensors and is protected by applicable intellectual property laws.</p><p>You may not copy, reproduce, modify, distribute, publish, or use any Website content without prior written permission from Cartrix.</p><p><br></p><h2>6. Limitation of Liability</h2><p>To the maximum extent permitted by law, Cartrix shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising out of or related to your use of the Website or the purchase or use of our products or services.</p><p>This includes, but is not limited to, loss of profits, data, business, or goodwill.</p><p><br></p><h2>7. Governing Law and Jurisdiction</h2><p>These Terms shall be governed by and interpreted in accordance with the laws of the <strong>United States</strong> and the <strong>State of New York</strong>, without regard to conflict-of-law principles.</p><p>Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>New York, United States</strong>.</p><p><br></p><h2>8. Changes to These Terms</h2><p>Cartrix reserves the right to modify or update these Terms at any time. Any changes will become effective immediately upon posting on the Website.</p><p>Your continued use of the Website after changes are posted constitutes your acceptance of the revised Terms and Conditions.</p><p><br></p><h2>9. Contact Us</h2><p>If you have any questions or concerns regarding these Terms and Conditions, please contact us:</p><p><strong>Website:</strong> <a href="http://cartrix.shop/" rel="noopener noreferrer" target="_blank">http://cartrix.shop/</a></p><p><strong>Email:</strong> <a href="mailto:support@cartrix.shop" rel="noopener noreferrer" target="_blank">support@cartrix.shop</a></p>',
  'terms-conditions',
  true,
  'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
) ON CONFLICT (slug, website_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = now();

-- 2. Privacy Policy
INSERT INTO policies (policy_type, title, content, slug, is_active, website_id)
VALUES (
  'privacy',
  'Privacy Policy – Cartrix',
  '<p>At <strong>Cartrix</strong>, your privacy is our priority. This website (http://cartrix.shop/) is operated by <strong>Prime Fix Solutions LLC</strong>. We are committed to being transparent about how we collect, use, store, and protect your personal information when you use our website or services.</p><p>By accessing or using our website, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use our services.</p><h3>1. Information We Collect</h3><h4>Personal Information You Provide</h4><p>We collect personal information that you voluntarily provide to us when you register, place an order, or contact customer support. This may include your full name, email address, phone number, and billing/shipping address.</p><h4>Payment Information</h4><p>All payments on <strong>Cartrix</strong> are processed securely through <strong>PayPal</strong>. We do not store or have direct access to your credit card, debit card, or bank account details. Payment information is handled directly by PayPal in accordance with their security and privacy standards.</p><h4>Automatically Collected Information</h4><p>When you visit our website, we may automatically collect certain information, including IP address, browser type, and usage data to improve website performance and security.</p><h3>2. Data Security</h3><p>We implement reasonable administrative, technical, and organizational safeguards to protect your personal information. However, no method of data transmission over the internet is 100% secure.</p><h3>3. Contact Information</h3><p>If you have any questions related to this Privacy Policy, please contact us:</p><p><strong>Website:</strong> <a href="http://cartrix.shop/" rel="noopener noreferrer" target="_blank">http://cartrix.shop/</a></p><p><strong>Email:</strong> support@cartrix.shop</p>',
  'privacy-policy',
  true,
  'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
) ON CONFLICT (slug, website_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = now();

-- 3. Shipping and Cancellation Policy
INSERT INTO policies (policy_type, title, content, slug, is_active, website_id)
VALUES (
  'shipping',
  'Shipping & Cancellation Policy',
  '<h2>Free Shipping Available</h2><p><strong>Cartrix</strong> offers <strong>free standard shipping on all orders over $100</strong> within the continental United States (Lower 48 states).</p><h2>Shipping Options &amp; Rates</h2><ul><li><strong>Standard Ground Shipping:</strong> 3–7 business days ($9.99, Free over $100)</li><li><strong>Expedited Shipping:</strong> 2–3 business days ($19.99)</li><li><strong>Next Day Air:</strong> 1 business day ($39.99)</li></ul><h2>Order Processing Times</h2><p>Processing times begin after payment confirmation. In-stock items are processed within 1-2 business days.</p><h2>Shipping Support</h2><p>For shipping-related questions or assistance:</p><p><strong>Email:</strong> support@cartrix.shop</p>',
  'shipping-cancellation',
  true,
  'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
) ON CONFLICT (slug, website_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = now();

-- 4. Return and Refund Policy
INSERT INTO policies (policy_type, title, content, slug, is_active, website_id)
VALUES (
  'refund',
  'Returns & Exchanges Policy – Cartrix',
  '<p>At <strong>Cartrix</strong>, we stand behind the quality of our products and are committed to customer satisfaction. We offer a <strong>30-day return window</strong> from the date of delivery for eligible items.</p><h2>Return Process</h2><p>To initiate a return, please email our support team at <strong>support@cartrix.shop</strong> to receive an RMA (Return Merchandise Authorization) number and instructions.</p><h2>Refund Processing</h2><p>After inspection, refunds are processed within <strong>3–5 business days</strong> to your original payment method.</p><h2>Contact Support</h2><p><strong>Email:</strong> support@cartrix.shop</p><p><strong>Support Hours:</strong> Monday–Friday: 9:00 AM – 6:00 PM EST</p>',
  'refund-policy',
  true,
  'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
) ON CONFLICT (slug, website_id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = now();
