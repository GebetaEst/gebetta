import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "@/constants/colors";

export default function TermsOfServices() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.modalText}>
        <Text style={styles.title}>Customer Agreement (Terms of Service)</Text>{"\n\n"}
        
        <Text style={styles.intro}>
          This Customer Agreement is entered into between Bahiran App and the Customer ("you"). By creating an account, placing an order, or otherwise using our services, you agree to the following terms:{"\n\n"}
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms: </Text>
        By using the Bahiran App or website, you agree to these Terms of Service. We may update these Terms from time to time, and continued use of our platform means you accept any changes.{"\n\n"}

        <Text style={styles.sectionTitle}>2. Services Provided: </Text>
        Bahiran App provides an online ordering and delivery service connecting customers with restaurants and independent delivery partners. Bahiran App itself does not cook or prepare food.{"\n\n"}

        <Text style={styles.sectionTitle}>3. Orders & Payments: </Text>
        Customers must pay using the payment methods available on the platform. Any applicable service or delivery fees will be clearly displayed.{"\n\n"}

        <Text style={styles.sectionTitle}>4. Delivery: </Text>
        Estimated delivery times are not guaranteed. Customers must be available at the provided address to receive orders. If an order cannot be delivered due to customer unavailability or incorrect details, the customer may still be charged.{"\n\n"}

        <Text style={styles.sectionTitle}>5. Food Quality & Responsibility: </Text>
        Restaurants are solely responsible for the quality and safety of the food if the delivery was still sealed. Bahiran App is not liable for food-related issues including allergies or spoilage. Customers should check packaging upon delivery.{"\n\n"}

        <Text style={styles.sectionTitle}>6. Refunds & Cancellations: </Text>
        Orders can only be cancelled before restaurant confirmation. Refunds, if any, are subject to company policy. Late delivery does not automatically qualify for a refund.{"\n\n"}

        <Text style={styles.sectionTitle}>7. Customer Conduct: </Text>
        Customers must provide accurate information and treat delivery partners and restaurant staff with respect. Fraudulent or abusive behavior may result in account suspension.{"\n\n"}

        <Text style={styles.sectionTitle}>8. Ratings & Reviews: </Text>
        Customers may leave reviews, but they must be fair and respectful. The Company reserves the right to remove abusive or false reviews.{"\n\n"}

        <Text style={styles.sectionTitle}>9. Liability Limitation: </Text>
        Bahiran App is not responsible for indirect damages such as delays, missed events, or dissatisfaction with food quality. The Company's maximum liability is limited to the order value.{"\n\n"}

        <Text style={styles.sectionTitle}>10. Privacy & Data Protection: </Text>
        Customer data will be used only for processing orders and improving services. We will not sell personal data to third parties.{"\n\n"}

        <Text style={styles.sectionTitle}>11. Termination of Service: </Text>
        The Company may suspend or terminate accounts if customers violate these Terms.{"\n\n"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  intro: {
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.primary,
    marginTop: 15,
    marginBottom: 5,
  },
});