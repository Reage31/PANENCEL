import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { useCart } from '../context/CartContext';
import { colors, radius, spacing } from '../theme';

interface Props {
  onBack: () => void; // volver al menú a seguir agregando productos
  onContinue: () => void; // ir a la pantalla de pago
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function CartScreen({ onBack, onContinue }: Props) {
  const { lines, total, count, add, remove, removeLine } = useCart();

  // Si el cliente quita todo, mostramos un estado vacío en lugar de dejarlo
  // avanzar a pagar un pedido sin productos.
  if (count === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyText}>Agrega productos desde el menú para hacer tu pedido.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
          <AppButton title="Volver al menú" onPress={onBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>PANADERÍA</Text>
        <Text style={styles.title}>Tu carrito</Text>
        <Text style={styles.subtitle}>Revisa tus productos y quita los que no vayas a llevar.</Text>

        <View style={styles.list}>
          {lines.map(({ product, qty }, i) => (
            <View key={product.id} style={[styles.line, i > 0 && styles.lineBorder]}>
              <Text style={styles.emoji}>{product.emoji}</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.unit}>{money(product.price)} c/u</Text>
                <Pressable
                  onPress={() => removeLine(product)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${product.name} del carrito`}
                >
                  <Text style={styles.removeText}>Quitar</Text>
                </Pressable>
              </View>

              <View style={styles.right}>
                <Text style={styles.lineTotal}>{money(qty * product.price)}</Text>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => remove(product)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar una unidad de ${product.name}`}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{qty}</Text>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => add(product)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar una unidad de ${product.name}`}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.subtotalBox}>
          <View>
            <Text style={styles.subtotalLabel}>Subtotal · MXN</Text>
            <Text style={styles.subtotalCount}>
              {count} {count === 1 ? 'artículo' : 'artículos'}
            </Text>
          </View>
          <Text style={styles.subtotalValue}>{money(total)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton variant="dark" title="Continuar al pago" onPress={onContinue} />
        <AppButton variant="link" title="Seguir comprando" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.md },
  brand: { color: colors.text, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: spacing.md },
  title: { fontSize: 32, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: spacing.md },

  list: { backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  lineBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  emoji: { fontSize: 32 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  unit: { color: colors.muted, fontSize: 12, marginTop: 2 },
  removeText: { color: colors.danger, fontWeight: '600', marginTop: 6 },
  right: { alignItems: 'flex-end', gap: spacing.sm },
  lineTotal: { fontWeight: '800', color: colors.primaryDark },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: colors.onPrimary, fontSize: 20, lineHeight: 22, fontWeight: '700' },
  qty: { fontWeight: '700', color: colors.text, minWidth: 16, textAlign: 'center' },

  subtotalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  subtotalLabel: { fontWeight: '700', color: colors.text },
  subtotalCount: { color: colors.muted, marginTop: 2 },
  subtotalValue: { fontSize: 26, fontWeight: '800', color: colors.text },

  footer: {
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 6 },
});
