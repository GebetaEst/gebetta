import {View , Text , StyleSheet } from "react-native";
import colors from "@/constants/colors";


export default function PrivacyPolice (){
    return(
        <Text style={styles.modalText}>
                <Text style={styles.sectionTitle}>1. Information We Collect{"\n"}</Text>
                • Personal information: Name, phone number, email address{"\n"}
                • Location data: Delivery addresses and GPS coordinates{"\n"}
                • Order history and preferences{"\n"}
                • Device information and usage data{"\n\n"}

                <Text style={styles.sectionTitle}>2. How We Use Your Information{"\n"}</Text>
                • Process and deliver your orders{"\n"}
                • Communicate about your orders and account{"\n"}
                • Improve our services and user experience{"\n"}
                • Send promotional offers (with your consent){"\n\n"}

                <Text style={styles.sectionTitle}>3. Information Sharing{"\n"}</Text>
                We share your information only with:{"\n"}
                • Partner restaurants to fulfill orders{"\n"}
                • Delivery personnel for order completion{"\n"}
                • Payment processors for transaction processing{"\n"}
                • Service providers who assist our operations{"\n\n"}

                <Text style={styles.sectionTitle}>4. Data Security{"\n"}</Text>
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.{"\n\n"}

                <Text style={styles.sectionTitle}>5. Your Rights{"\n"}</Text>
                You have the right to:{"\n"}
                • Access your personal data{"\n"}
                • Correct inaccurate information{"\n"}
                • Delete your account and data{"\n"}
                • Opt-out of marketing communications{"\n\n"}

                <Text style={styles.sectionTitle}>6. Cookies and Tracking{"\n"}</Text>
                We use cookies and similar technologies to enhance your experience and analyze app usage. You can manage cookie preferences in your device settings.{"\n\n"}

                <Text style={styles.sectionTitle}>7. Children's Privacy{"\n"}</Text>
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.{"\n\n"}

                <Text style={styles.sectionTitle}>8. Contact Us{"\n"}</Text>
                For privacy-related questions, contact us at privacy@gebetadelivery.com
              </Text>
    )
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