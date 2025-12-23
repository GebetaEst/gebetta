import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Mail, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MapPin
} from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'To place an order, browse through restaurants, select items you want, add them to cart, and proceed to checkout. You can pay using various payment methods including cards and mobile money.'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit/debit cards (Visa, Mastercard),chapa payment, mobile money (Telebirr), and cash on delivery for selected areas.'
  },
  {
    id: '3',
    question: 'How long does delivery take?',
    answer: 'Delivery time varies by location and restaurant, typically ranging from 30-60 minutes. You can track your order in real-time once it\'s confirmed.'
  },
  {
    id: '4',
    question: 'Can I cancel my order?',
    answer: 'You can cancel your order within 5 minutes of placing it. After that, please contact the restaurant directly or our support team for assistance.'
  },
  {
    id: '5',
    question: 'How do I track my order?',
    answer: 'Once your order is confirmed, you\'ll receive a tracking link. You can also check order status in the "My Orders" section of your profile.'
  },
  {
    id: '6',
    question: 'What if my order is incorrect or missing items?',
    answer: 'If you receive an incorrect or incomplete order, please contact us immediately through the app or our support channels. We\'ll resolve the issue and may offer a refund or replacement.'
  },
  {
    id: '7',
    question: 'Do you deliver to my area?',
    answer: 'We\'re continuously expanding our delivery areas. Enter your address in the app to check if we deliver to your location. New areas are added regularly.'
  },
  {
    id: '8',
    question: 'How do I update my profile information?',
    answer: 'Go to your Profile section, tap "Edit Profile" to update your personal information, or "My Addresses" to manage your delivery addresses.'
  },
  {
    id: '9',
    question: 'Is there a minimum order amount?',
    answer: 'Minimum order amounts vary by restaurant and are clearly displayed on each restaurant page. This helps ensure delivery efficiency.'
  },
  {
    id: '10',
    question: 'How do I report a problem with the app?',
    answer: 'You can report technical issues through the "Contact Support" option in settings, or reach out to us via email, phone, or Telegram using the contact methods below.'
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleEmailContact = () => {
    const email = 'support@bahraindelivery.app';
    const subject = 'Help Request';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please send an email to: ${email}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Email Not Available',
          `Please send an email to: ${email}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handlePhoneContact = () => {
    const phoneNumber = '+251911234567';
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert(
            'Phone Not Available',
            `Please call: ${phoneNumber}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Phone Not Available',
          `Please call: ${phoneNumber}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleTelegramContact = () => {
    const telegramUsername = 'bahrain_support';
    const telegramUrl = `https://t.me/${telegramUsername}`;
    
    Linking.canOpenURL(telegramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(telegramUrl);
        } else {
          Alert.alert(
            'Telegram Not Available',
            `Please contact us on Telegram: @${telegramUsername}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Telegram Not Available',
          `Please contact us on Telegram: @${telegramUsername}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleInstagramContact = () => {
    const instagramUsername = 'bahrain_app';
    const instagramUrl = `https://instagram.com/${instagramUsername}`;

    Linking.canOpenURL(instagramUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(instagramUrl);
        } else {
          Alert.alert(
            'Instagram Not Available',
            `Please find us on Instagram: @${instagramUsername}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Instagram Not Available',
          `Please find us on Instagram: @${instagramUsername}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleTikTokContact = () => {
    const tiktokUsername = 'bahrain_app';
    const tiktokUrl = `https://www.tiktok.com/@${tiktokUsername}`;

    Linking.canOpenURL(tiktokUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(tiktokUrl);
        } else {
          Alert.alert(
            'TikTok Not Available',
            `Please find us on TikTok: @${tiktokUsername}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'TikTok Not Available',
          `Please find us on TikTok: @${tiktokUsername}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleAddressContact = () => {
    const address = 'Bole Road, Addis Ababa, Ethiopia';
    const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
    
    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          Alert.alert(
            'Our Office Address',
            address,
            [{ text: 'OK' }]
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Our Office Address',
          address,
          [{ text: 'OK' }]
        );
      });
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>
            Get in touch with our support team
          </Text>
       


          {/* Office Address */}
          {/* <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleAddressContact}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
              <MapPin size={24} color="#8B5CF6" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Visit Our Office</Text>
              <Text style={styles.contactDescription}>Bole Road, Addis Ababa, Ethiopia</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity> */}

          {/* Email Contact */}
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleEmailContact}
            activeOpacity={0.7}
          >
            <View style={styles.contactIcon}>
              <Mail size={24} color="#FF6B6B" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>deliverybahrain@gmail.com</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>

          {/* Phone Contact */}
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handlePhoneContact}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#4ECDC4' + '20' }]}>
              <Text style={[styles.contactIconText, { color: '#4ECDC4' }]}>📞</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Phone Support</Text>
              <Text style={styles.contactDescription}>+2519 194 44499</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>

          {/* Telegram Contact */}
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleTelegramContact}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#0088CC' + '20' }]}>
              <MessageCircle size={24} color="#0088CC" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Telegram Support</Text>
              <Text style={styles.contactDescription}>@bahrain_support</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleInstagramContact}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E1306C' + '20' }]}>
              <Text style={[styles.contactIconText, { color: '#E1306C' }]}>📸</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Instagram</Text>
              <Text style={styles.contactDescription}>@bahrain_app</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleTikTokContact}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#000000' + '20' }]}>
              <Text style={[styles.contactIconText, { color: '#000000' }]}>🎵</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>TikTok</Text>
              <Text style={styles.contactDescription}>@bahrain_app</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <MessageCircle size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Find answers to common questions
          </Text>

          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp size={20} color={colors.primary} />
                  ) : (
                    <ChevronDown size={20} color={colors.lightText} />
                  )}
                </TouchableOpacity>
                
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
                
                {index < faqs.length - 1 && <View style={styles.faqSeparator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
    
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 12,
    paddingVertical: 20,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.lightText,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B6B' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    ...typography.subtitle1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    ...typography.body,
    color: colors.lightText,
    fontSize: 14,
  },
  faqContainer: {
    paddingHorizontal: 20,
  },
  faqItem: {
    marginBottom: 4,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqQuestionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    fontSize: 15,
  },
  faqAnswer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  faqAnswerText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    fontSize: 14,
  },
  faqSeparator: {
    height: 12,
  },
  bottomSpacing: {
    height: 32,
  },
});
