import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export default function App() {
  const [tap, setTap] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [pass, setPass] = useState('');
  const [logged, setLogged] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [monthly, setMonthly] = useState('199');
  const [commission, setCommission] = useState('0');

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'products'), s => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'orders'), s => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const load = async () => {
      const d = await getDoc(doc(db, 'settings', 'main'));
      if (d.exists()) { setMonthly(String(d.data().monthly)); setCommission(String(d.data().commission)); }
    };
    load();
    return () => { u1(); u2(); };
  }, []);

  const secretTap = () => {
    const n = tap + 1;
    setTap(n);
    if (n >= 5) { setShowLogin(true); setTap(0); }
  };

  const login = () => {
    if (pass === 'SR143') { setLogged(true); }
    else Alert.alert('Galat Password', 'Secret Password galat hai');
  };

  const saveSettings = async () => {
    await setDoc(doc(db, 'settings', 'main'), { monthly: Number(monthly), commission: Number(commission) });
    Alert.alert('Save Ho Gaya', 'Monthly ' + monthly + ' | Commission ' + commission + '% - Ab sab jagah yahi lagega');
  };

  if (!logged) {
    return (
      <ScrollView style={s.box}>
        <TouchableOpacity onPress={secretTap}><Text style={s.title}>Budget Dost SR - Admin</Text></TouchableOpacity>
        <Text style={s.small}>Admin Login ke liye upar Title pe 5 baar dabao - Secret Login</Text>
        {showLogin ? <>
          <TextInput style={s.inp} placeholder="Secret Password - SR143" secureTextEntry value={pass} onChangeText={setPass} />
          <TouchableOpacity style={s.btn} onPress={login}><Text style={s.btnT}>Admin Login</Text></TouchableOpacity>
        </> : <Text style={{ marginTop: 20, color: 'grey' }}>Normal user ko yaha login nahi dikhega, sirf tujhe pata hai 5-Tap ka secret.</Text>}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.box}>
      <Text style={s.title}>Admin Panel - SARTAJ</Text>
      <Text style={s.sub}>Settings Yaha Se Badlo - Customer/Supplier me Auto Badlega</Text>
      <Text>Monthly Fee ₹</Text>
      <TextInput style={s.inp} keyboardType="numeric" value={monthly} onChangeText={setMonthly} />
      <Text>Commission %</Text>
      <TextInput style={s.inp} keyboardType="numeric" value={commission} onChangeText={setCommission} />
      <TouchableOpacity style={s.btn} onPress={saveSettings}><Text style={s.btnT}>Settings Save Karo</Text></TouchableOpacity>

      <Text style={[s.title, { marginTop: 20 }]}>Pending Products - Approve / Reject</Text>
      {products.filter(p => p.status === 'pending').length === 0 ? <Text>Koi Pending nahi</Text> : null}
      {products.filter(p => p.status === 'pending').map(p => (
        <View key={p.id} style={s.card}>
          <Text style={{ fontWeight: 'bold' }}>{p.name} - ₹{p.price} - {p.category}</Text>
          <Text>{p.desc}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[s.smallBtn, { backgroundColor: 'green' }]} onPress={() => updateDoc(doc(db, 'products', p.id), { status: 'approved' })}><Text style={s.btnT}>Approve</Text></TouchableOpacity>
            <TouchableOpacity style={[s.smallBtn, { backgroundColor: 'red' }]} onPress={() => updateDoc(doc(db, 'products', p.id), { status: 'rejected' })}><Text style={s.btnT}>Reject</Text></TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[s.title, { marginTop: 20 }]}>Approved Products: {products.filter(p => p.status === 'approved').length}</Text>
      <Text style={[s.title, { marginTop: 20 }]}>Orders: {orders.length}</Text>
      {orders.map(o => (
        <View key={o.id} style={s.card}>
          <Text>Order ₹{o.total} - {o.status} - {o.paymentType}</Text>
          <Text style={{ fontSize: 12 }}>COD ho to 7 din baad Supplier ko payment bhej dena</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({ box: { padding: 16, backgroundColor: '#fff' }, title: { fontSize: 20, fontWeight: 'bold', color: '#0D5CFF' }, sub: { backgroundColor: '#FFF3E0', padding: 8, marginVertical: 8, fontWeight: 'bold', fontSize: 12 }, inp: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginVertical: 5 }, btn: { backgroundColor: '#0D5CFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 }, btnT: { color: '#fff', fontWeight: 'bold' }, small: { fontSize: 11, color: 'grey', marginTop: 8 }, card: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginVertical: 6 }, smallBtn: { backgroundColor: '#0D5CFF', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 6, flex: 1 } });
