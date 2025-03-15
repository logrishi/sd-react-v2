import { EMAIL } from "@/lib/utils/constants";

const Privacy = () => {
  return (
    <div className="app-container">
      <h1 className="text-lg font-semibold">Welcome!</h1>
      <p>
        Greetings everyone, I am Dr. Dilip Sarmah. Welcome on-board to my digital collection of E-Books, E-Magazines,
        and other digital publications.
      </p>

      <h1 className="text-lg font-semibold pt-4">Shipping Policy</h1>
      <p>
        We strive to deliver your digital products promptly and efficiently. Here's our Shipping Policy: 1. Delivery
        Method: - All digital products are delivered electronically. - Once your payment is confirmed, you will receive
        an email with instructions to access and download your purchased digital products. 2. Delivery Time: - Delivery
        times may vary depending on the type of digital product purchased. - Instant downloads will be available
        immediately after payment confirmation. - For customized digital products, delivery times will be communicated
        during the ordering process. 3. Technical Requirements: - Ensure that your device meets the specified technical
        requirements for downloading and using the digital product. 4. Contact Information: - If you encounter any
        issues with your digital product delivery, please contact our customer support at {EMAIL}.
      </p>
      <h1 className="text-lg font-semibold pt-4">Return and Refund Policy</h1>
      <p>
        We want you to be satisfied with your digital product purchase. Here's our Return and Refund Policy: 1. Refunds
        are not applicable for our digital products. 2. In case of transaction related issues send email at {EMAIL}.
      </p>
      <h1 className="text-lg font-semibold pt-4">Privacy Policy</h1>
      <p>
        Protecting your privacy is important to us. Here's our Privacy Policy: 1. Information Collection: - We collect
        only essential information required for processing your digital product orders. - Personal information is kept
        confidential and is not shared with third parties. 2. Security Measures: - We implement industry-standard
        security measures to protect your personal information and payment details. 3. Communication: - By providing
        your email, you agree to receive order updates and relevant communications. You can opt-out at any time.
      </p>
      <h1 className="text-lg font-semibold pt-4">Terms and Conditions</h1>
      <p>
        Here are our Terms and Conditions: 1. License Agreement: - Purchasing a digital product grants you a
        non-exclusive, non-transferable license to use the product for personal purposes only. 2. Intellectual Property:
        - All digital products and content on our website/app are the intellectual property of Saraighat Digital.
        Unauthorized use is prohibited. 3. Modification and Updates: - We reserve the right to modify, update, or
        discontinue any digital product without prior notice. 4. Limitation of Liability: - Dilip Sarmah is not liable
        for any direct, indirect, or consequential damages arising from the use or inability to use our digital
        products. 5. Governing Law: - These terms and conditions are governed by the laws of India. Any disputes will be
        resolved in the courts of Guwahati, Assam. By using our website/app and purchasing digital products, you agree
        to abide by these terms and conditions.
      </p>

      <h1 className="text-lg font-semibold pt-4">Account Deletion</h1>
      <p>
        You have the right to request deletion of your account and associated data: 1. Process: - Submit a deletion
        request through your account settings or by emailing {EMAIL}. - Account deletion will remove all personal
        information, purchase history, and saved preferences. 2. Timeline: - Account deletion requests are typically
        processed within 30 days. 3. Data Retention: - Some information may be retained for legal or administrative
        purposes as required by law. 4. Purchased Content: - Access to previously purchased digital content will be
        revoked upon account deletion.
      </p>
    </div>
  );
};

export default Privacy;
