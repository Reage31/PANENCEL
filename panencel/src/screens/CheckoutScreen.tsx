import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { CardPaymentModal } from '../components/CardPaymentModal';
import { useCart } from '../context/CartContext';
import { PaymentMethod } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  onBack: () => void;
  onConfirm: (method: PaymentMethod) => void;
}

const METHODS: { id: PaymentMethod; title: string; hint: string; icon: string }[] = [
  { id: 'efectivo', title: 'Efectivo', hint: 'Paga en caja', icon: '💵' },
  { id: 'tarjeta', title: 'Tarjeta', hint: 'Crédito o débito', icon: '💳' },
];

const money = (n: number) => `$${n.toFixed(2)}`;

export function CheckoutScreen({ onBack, onConfirm }: Props) {
  const { lines, total, count } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [cardOpen, setCardOpen] = useState(false);

  const handleGenerate = () => {
    if (method === 'tarjeta') setCardOpen(true);
    else onConfirm('efectivo');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>PANADERÍA</Text>
        <Text style={styles.title}>Tu pedido</Text>
        <Text style={styles.subtitle}>Un último vistazo antes de pasar a caja.</Text>

        <View style={styles.summary}>
          <Text style={styles.count}>
            {count} {count === 1 ? 'producto' : 'productos'}
          </Text>
          {lines.map(({ product, qty }, i) => (
            <View key={product.id} style={[styles.line, i > 0 && styles.lineBorder]}>
              <Text style={styles.lineName}>
                {qty} × {product.name}
              </Text>
              <Text style={styles.lineName}>{money(qty * product.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total · MXN</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>

        <Text style={styles.subtitle}>Elige cómo quieres pagar tu pedido.</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.method, active && styles.methodActive]}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={styles.methodTitle}>{m.title}</Text>
                <Text style={styles.methodHint}>{m.hint}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: spacing.xs }}>
          <AppButton variant="dark" title="Generar código de pago" onPress={handleGenerate} />
          {/* CAMBIO (carrito): antes decía "Volver al menú". Ahora el paso anterior es el carrito. */}
          <AppButton variant="link" title="Volver al carrito" onPress={onBack} />
        </View>
      </ScrollView>

      <CardPaymentModal
        visible={cardOpen}
        total={total}
        onClose={() => setCardOpen(false)}
        onPay={() => {
          setCardOpen(false);
          onConfirm('tarjeta');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.md },
  title: { fontSize: 32, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: spacing.md },
  summary: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md },
  count: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  lineBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  lineName: { fontWeight: '700', color: colors.text, flexShrink: 1 },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  totalLabel: { fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  methods: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  method: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  methodActive: { backgroundColor: colors.cream, borderColor: colors.primary },
  methodIcon: { fontSize: 20, marginBottom: spacing.sm },
  methodTitle: { fontWeight: '700', color: colors.text },
  methodHint: { color: colors.muted, marginTop: 2 },
});
