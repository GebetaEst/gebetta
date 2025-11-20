import {View , Text , StyleSheet } from "react-native";
import colors from "@/constants/colors";

export default function TermsOfServices() {
  return (
    <Text style={styles.modalText}>
                <Text style={styles.sectionTitle}>1. Acceptance of Terms{"\n"}</Text>
                By using our food delivery service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.{"\n\n"}

                <Text style={styles.sectionTitle}>2. Service Description{"\n"}</Text>
                Our platform connects customers with local restaurants for food delivery. We facilitate orders but do not prepare or deliver food directly.{"\n\n"}

                <Text style={styles.sectionTitle}>3. User Responsibilities{"\n"}</Text>
                • Provide accurate delivery information{"\n"}
                • Pay for orders in full{"\n"}
                • Treat delivery personnel respectfully{"\n"}
                • Report any issues promptly{"\n\n"}

                <Text style={styles.sectionTitle}>4. Payment Terms{"\n"}</Text>
                All payments are processed securely. Refunds are subject to our refund policy and may take 3-5 business days to process.{"\n\n"}

                <Text style={styles.sectionTitle}>5. Limitation of Liability{"\n"}</Text>
                We are not responsible for food quality, preparation delays, or delivery issues beyond our control. Our liability is limited to the order value.{"\n\n"}

                <Text style={styles.sectionTitle}>6. Account Termination{"\n"}</Text>
                We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.{"\n\n"}

                <Text style={styles.sectionTitle}>7. Changes to Terms{"\n"}</Text>
                We may update these terms periodically. Continued use of our service constitutes acceptance of any changes.{"\n\n"}

                <Text style={styles.sectionTitle}>8. Contact Information{"\n"}</Text>
                For questions about these terms, please contact us at support@gebetadelivery.com
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