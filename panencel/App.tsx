import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
// CAMBIO 1: se importa el carrito (provider y hook) y las dos pantallas nuevas.
import { CartProvider, useCart } from './src/context/CartContext';
// CAMBIO (carrito): se importa la nueva pantalla intermedia.
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { colors } from './src/theme';
import { Order, PaymentMethod } from './src/types';

type AuthRoute = 'login' | 'register';
// CAMBIO 2: nuevo tipo con las pantallas a las que accede un usuario ya autenticado.
// Sigue la misma idea que `AuthRoute`, sin instalar React Navigation todavía.
// CAMBIO (carrito): se agrega 'cart' entre el menú y el pago.
type AppRoute = 'menu' | 'cart' | 'checkout' | 'success';

// CAMBIO 3: genera el código del pedido (ej. PAN-8503). Es de ejemplo; cuando
// haya backend, el servidor debería generar el código para que no se repita.
const generateCode = () => `PAN-${Math.floor(1000 + Math.random() * 9000)}`;

function Root() {
  const { user } = useAuth();
  // CAMBIO 4: se lee el carrito para poder "fotografiar" el pedido al confirmarlo.
  const { total, count, clear } = useCart();
  const [route, setRoute] = useState<AuthRoute>('login');
  // CAMBIO 5: estados nuevos. `screen` indica qué pantalla ve el usuario logueado y
  // `order` guarda el pedido ya confirmado para mostrarlo en "¡Pedido listo!".
  const [screen, setScreen] = useState<AppRoute>('menu');
  const [order, setOrder] = useState<Order | null>(null);

  // CAMBIO 6: al cerrar sesión se reinicia todo. Sin esto, si alguien sale y otro
  // usuario entra, podría ver el carrito o el pedido anterior.
  useEffect(() => {
    if (!user) {
      setScreen('menu');
      setOrder(null);
      clear();
    }
  }, [user]);

  // CAMBIO 7: se ejecuta al confirmar el pago (efectivo, o tarjeta en el modal).
  // Guarda una copia del pedido (total y cantidad) y vacía el carrito, porque
  // el carrito ya no es necesario y el pedido seguirá visible en la pantalla final.
  const handleConfirm = (method: PaymentMethod) => {
    setOrder({ code: generateCode(), total, count, method });
    clear();
    setScreen('success');
  };

  // CAMBIO 8: "Hacer un nuevo pedido" regresa al menú con el carrito ya vacío.
  const handleNewOrder = () => {
    setOrder(null);
    setScreen('menu');
  };

  // Botón "atrás" de Android.
  // CAMBIO 9: antes solo manejaba Registro -> Login. Ahora también:
  //  - Checkout -> Menú (para no cerrar la app por accidente a mitad del pedido).
  //  - Pedido listo -> Menú nuevo (no tiene sentido volver a pagar).
  // Se agregó `screen` a las dependencias para que el listener use el valor actual.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!user && route === 'register') {
        setRoute('login');
        return true;
      }
      // CAMBIO (carrito): atrás desde Checkout vuelve al carrito, y desde el carrito al menú.
      if (user && screen === 'checkout') {
        setScreen('cart');
        return true;
      }
      if (user && screen === 'cart') {
        setScreen('menu');
        return true;
      }
      if (user && screen === 'success') {
        handleNewOrder();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [user, route, screen]);

  // CAMBIO 10: antes era `if (user) return <MenuScreen />;`. Ahora el usuario
  // autenticado ve una pantalla u otra según `screen`.
  if (!user) {
    return route === 'login' ? (
      <LoginScreen onGoRegister={() => setRoute('register')} />
    ) : (
      <RegisterScreen onGoLogin={() => setRoute('login')} />
    );
  }

  // CAMBIO (carrito): el carrito va entre el menú y el pago. Al continuar pasa a Checkout.
  if (screen === 'cart') {
    return <CartScreen onBack={() => setScreen('menu')} onContinue={() => setScreen('checkout')} />;
  }
  // CAMBIO (carrito): onBack de Checkout ahora regresa al carrito (antes al menú).
  if (screen === 'checkout') {
    return <CheckoutScreen onBack={() => setScreen('cart')} onConfirm={handleConfirm} />;
  }
  // `&& order` evita un error si por algún motivo se llega aquí sin pedido.
  if (screen === 'success' && order) {
    return <OrderSuccessScreen order={order} onNewOrder={handleNewOrder} />;
  }
  // CAMBIO (carrito): "Continuar" del menú ahora abre el carrito en lugar de ir directo al pago.
  return <MenuScreen onContinue={() => setScreen('cart')} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* CAMBIO 11: CartProvider envuelve a Root para que Menú, Checkout y el
            resto de pantallas compartan el mismo carrito. Va dentro de AuthProvider
            por orden lógico: primero la sesión, luego lo que el usuario compra. */}
        <CartProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style="dark" />
            <Root />
          </SafeAreaView>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
