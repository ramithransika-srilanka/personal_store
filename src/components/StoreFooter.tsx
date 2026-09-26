import { forwardRef } from 'react';
import polysocialLogo from '../assets/polysocial-logo.svg';

// Mirrors the footer of the Polysocial mobile site (polysocial.cc), whose pages its links point to.
const SITE = 'https://polysocial.cc/';

const legal: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Content Review, Approval, and Disputes',
    paragraphs: [
      'When a Campaign Owner approves a submission, the Creator earns the base payout and any performance pay. If the Campaign Owner does not approve or reject within 48 hours, the Platform may auto-confirm payment, provided the Content followed the Campaign Owner’s guidelines. A Campaign Owner may still raise a dispute after auto-confirmation; disputes go to a special Platform inquiry, and the Platform’s decision is final. Rejected or unpaid Content stays fully owned by the Creator.',
    ],
  },
  {
    title: 'Payments, Fees, and the Wallet',
    paragraphs: [
      'The Platform holds a Campaign’s full budget before it begins and pays it out as Content is approved and confirmed; any leftover budget is refunded to the Campaign Owner with no fee. The Platform takes a 10% commission on each Creator transaction, inclusive of all charges, so the Creator receives the balance. Campaign Owners pay no platform fee, but a 3% payment-processing charge applies to campaigns funded through an online gateway (not to bank transfers) and is borne by the Campaign Owner.',
      'Earnings are made available through the Wallet, and a Creator may cash out once per day, via internet payment gateway or bank transfer. Bank details are used only for deposits and never shared. No tax is withheld from earnings; if any deduction is required, the Creator is notified on the transfer confirmation page beforehand. Each user handles their own tax obligations.',
    ],
  },
  {
    title: 'Performance-Based Pay and View Measurement',
    paragraphs: [
      'Performance pay is based solely on views, measured through the official APIs of the relevant social media platforms via OAuth. Only metrics each platform permits, within the scope the Creator authorizes, are accessed. The method or rate may change, with notice. To earn and keep payment, a Creator’s post must stay online and public until the Campaign ends (or any period the Campaign Owner sets). If it is taken down, made private, or removed before then, the Creator is not paid for that Content and must resubmit it as a new transaction.',
    ],
  },
  {
    title: 'Content Ownership and Copyright',
    paragraphs: [
      'Creators own the Content they create and publish, and may always keep it on their own channels and reuse it in a portfolio. Where a Campaign expressly requests raw Content and payment is completed, copyright in that Content transfers to the Platform — whether it received a base payout only or also performance pay. After transfer, the Platform may use the Content on its own channels; the Campaign Owner may use it only with the Platform’s consent; and neither may sell it to a third party. If a Creator is not paid, copyright stays fully with the Creator and none of these transfer rights apply.',
    ],
  },
  {
    title: 'Creator Status',
    paragraphs: [
      'Creators are independent contractors (freelancers). Nothing here creates an employment, agency, partnership, or joint-venture relationship with the Platform or any Campaign Owner, and Creators have no authority to bind either.',
    ],
  },
];

// The end of the feed: the "Powered by Polysocial" block under the last look, then the
// Polysocial site footer.
export const StoreFooter = forwardRef<HTMLElement>(function StoreFooter(_, ref) {
  return (
    <footer className="store-end" ref={ref}>
      <div className="store-end__cta">
        <p className="store-end__powered">Powered by Polysocial</p>
        <a className="store-end__btn store-end__btn--primary" href={`${SITE}brand-access.html`}>
          Create your own store
        </a>
        <a className="store-end__btn" href={`${SITE}brands.html`}>
          Promote your brand
        </a>
      </div>

      <div className="ps-footer">
        <div className="ps-footer__brand">
          <div className="ps-footer__logo">
            <img src={polysocialLogo} alt="polysocial" width={131} height={24} loading="lazy" decoding="async" />
            <span className="ps-footer__tagline">Monetizing word-of-mouth</span>
          </div>
          <div className="ps-footer__contact">
            <p>
              You can call us on <a href="tel:+94772540134">+94 772 540 134</a> or email us on{' '}
              <a href="mailto:support@polysocial.cc">support@polysocial.cc</a>
            </p>
            <span>Sri Lanka</span>
          </div>
        </div>

        <div className="ps-footer__rule" />

        <div className="ps-footer__legal">
          {legal.map((section) => (
            <div key={section.title}>
              <span>{section.title}</span>
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="ps-footer__rule" />

        <div className="ps-footer__meta">
          <span>© 2026 Polysocial. All rights reserved.</span>
          <a href={`${SITE}privacy.html`}>Privacy policy</a>
          <a href={`${SITE}terms.html`}>Terms and conditions</a>
          <a href={`${SITE}data-deletion.html`}>Data deletion &amp; retention policy</a>
        </div>
      </div>
    </footer>
  );
});
