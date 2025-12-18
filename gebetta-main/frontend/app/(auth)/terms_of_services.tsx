import {View , Text , StyleSheet } from "react-native";
import colors from "@/constants/colors";

export default function TermsOfServices() {
  return (
    <Text style={styles.modalText}>
      <Text style={styles.sectionTitle}>Customer Agreement (Terms of Service){"\n"}</Text>
      This Customer Agreement is entered into between Bahiran and the Customer ("you"). By creating an account, placing an order, or otherwise using our services, you agree to the following terms:{"\n\n"}

      <Text style={styles.sectionTitle}>1. Acceptance of Terms{"\n"}</Text>
      By using the Bahiran app or website, you agree to these Terms of Service. We may update these Terms from time to time, and continued use of our platform means you accept any changes.{"\n\n"}

      <Text style={styles.sectionTitle}>2. Services Provided{"\n"}</Text>
      Bahiran provides an online ordering and delivery service connecting customers with restaurants and independent delivery partners. Bahiran itself does not cook or prepare food.{"\n\n"}

      <Text style={styles.sectionTitle}>3. Orders & Payments{"\n"}</Text>
      Customers must pay using the payment methods available on the platform. Any applicable service or delivery fees will be clearly displayed.{"\n\n"}

      <Text style={styles.sectionTitle}>4. Delivery{"\n"}</Text>
      Estimated delivery times are not guaranteed. Customers must be available at the provided address to receive orders. If an order cannot be delivered due to customer unavailability or incorrect details, the customer may still be charged.{"\n\n"}

      <Text style={styles.sectionTitle}>5. Food Quality & Responsibility{"\n"}</Text>
      Restaurants are solely responsible for the quality and safety of the food if the delivery was still sealed. Bahiran is not liable for food-related issues including allergies or spoilage. Customers should check packaging upon delivery.{"\n\n"}

      <Text style={styles.sectionTitle}>6. Refunds & Cancellations{"\n"}</Text>
      Orders can only be cancelled before restaurant confirmation. Refunds, if any, are subject to company policy. Late delivery does not automatically qualify for a refund.{"\n\n"}

      <Text style={styles.sectionTitle}>7. Customer Conduct{"\n"}</Text>
      Customers must provide accurate information and treat delivery partners and restaurant staff with respect. Fraudulent or abusive behavior may result in account suspension.{"\n\n"}

      <Text style={styles.sectionTitle}>8. Ratings & Reviews{"\n"}</Text>
      Customers may leave reviews, but they must be fair and respectful. The Company reserves the right to remove abusive or false reviews.{"\n\n"}

      <Text style={styles.sectionTitle}>9. Liability Limitation{"\n"}</Text>
      Bahiran is not responsible for indirect damages such as delays, missed events, or dissatisfaction with food quality. The Company's maximum liability is limited to the order value.{"\n\n"}

      <Text style={styles.sectionTitle}>10. Privacy & Data Protection{"\n"}</Text>
      Customer data will be used only for processing orders and improving services. We will not sell personal data to third parties.{"\n\n"}

      <Text style={styles.sectionTitle}>11. Termination of Service{"\n"}</Text>
      The Company may suspend or terminate accounts if customers violate these Terms.{"\n\n"}

      <Text style={styles.sectionTitle}>Contact Information{"\n"}</Text>
      For questions about these terms, please contact us at support@bahiran delivery.com
    </Text>
  );
}

const styles = StyleSheet.create({
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.black,
  },
});