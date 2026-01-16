-- Migration to add FAQs for Cartrix.shop
-- Website ID: df707bc1-f8fd-44fc-856b-fa6bb12f41a7

DELETE FROM faqs WHERE website_id = 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7';

INSERT INTO faqs (question, answer, display_order, is_active, website_id)
VALUES 
(
  'What is the estimated delivery time for my order?', 
  'Most orders are processed within 1-2 business days. Standard shipping typically takes 3-7 business days depending on your location.',
  1, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'Do you offer free shipping?', 
  'Yes! We offer free standard shipping on all orders over $100 within the continental United States.',
  2, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'How can I track my order?', 
  'Once your order has shipped, you will receive an email with a tracking number and a link to track your package.',
  3, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'What is your return policy?', 
  'We offer a 30-day return policy for most items. Products must be in their original condition and packaging. Please contact support@cartrix.shop to initiate a return.',
  4, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'Are the ink cartridges you sell original or compatible?', 
  'We sell both Genuine OEM (Original Equipment Manufacturer) and high-quality compatible cartridges. Each product page clearly indicates the type of cartridge.',
  5, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'What payment methods do you accept?', 
  'We currently accept all major credit cards and PayPal for secure transactions.',
  6, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
),
(
  'How do I know which ink or toner is compatible with my printer?', 
  'You can search by your printer model number on our website, or check the documentation that came with your printer. If you''re still unsure, contact our support team.',
  7, true, 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7'
);
