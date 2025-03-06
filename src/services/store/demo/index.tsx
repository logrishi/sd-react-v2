// import { createElement, type FC } from "@/lib/vendors";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
// import { Button } from "@/components/common/ui/button";
// import { Input } from "@/components/common/ui/input";
// import { Switch } from "@/components/common/ui/switch";
// import { store } from "./store";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/ui/select";

// // Counter Demo
// const CounterDemo: FC = () => {
//   // Reactive state access
//   const { count } = store.counter();

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Counter Demo</CardTitle>
//         <CardDescription>Direct state management</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="text-2xl font-bold">Count: {count}</div>
//         <div className="flex gap-2">
//           <Button onClick={() => store.counter.set({ count: count - 1 })}>Decrease</Button>
//           <Button onClick={() => store.counter.set({ count: count + 1 })}>Increase</Button>
//         </div>
//         <div className="text-sm text-muted-foreground">
//           Non-reactive value: {store.counter.get().count}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Theme Demo
// const ThemeDemo: FC = () => {
//   const { mode } = store.theme();

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Theme Demo</CardTitle>
//         <CardDescription>Persisted direct state</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex items-center justify-between">
//           <span>Dark Mode</span>
//           <Switch
//             checked={mode === "dark"}
//             onCheckedChange={(checked) => store.theme.set({ mode: checked ? "dark" : "light" })}
//           />
//         </div>
//         <div className="text-sm text-muted-foreground">
//           Theme persists across page reloads
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Todo Demo
// const TodoDemo: FC = () => {
//   const { items, filter } = store.todos();

//   const addTodo = (text: string) => {
//     store.todos.set({
//       items: [...items, { id: Date.now().toString(), text, completed: false }],
//     });
//   };

//   const toggleTodo = (id: string) => {
//     store.todos.set({
//       items: items.map((item) =>
//         item.id === id ? { ...item, completed: !item.completed } : item
//       ),
//     });
//   };

//   const filteredItems = items.filter((item) => {
//     if (filter === "active") return !item.completed;
//     if (filter === "completed") return item.completed;
//     return true;
//   });

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Todo Demo</CardTitle>
//         <CardDescription>Array state management</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex gap-2">
//           <Input
//             placeholder="New todo"
//             onKeyPress={(e) => {
//               if (e.key === "Enter") {
//                 addTodo(e.currentTarget.value);
//                 e.currentTarget.value = "";
//               }
//             }}
//           />
//         </div>
//         <Select
//           value={filter}
//           onValueChange={(value) => store.todos.set({ filter: value as any })}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Filter todos" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="completed">Completed</SelectItem>
//           </SelectContent>
//         </Select>
//         <div className="space-y-2">
//           {filteredItems.map((item) => (
//             <div
//               key={item.id}
//               className="flex items-center gap-2 p-2 border rounded"
//               onClick={() => toggleTodo(item.id)}
//             >
//               <input type="checkbox" checked={item.completed} readOnly />
//               <span className={item.completed ? "line-through" : ""}>{item.text}</span>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Form Demo
// const FormDemo: FC = () => {
//   const { username, email, age, isValid } = store.form();

//   const validateForm = (updates: Partial<typeof store.form.get()>) => {
//     const current = store.form.get();
//     const next = { ...current, ...updates };
//     const isValid =
//       next.username.length >= 3 && next.email.includes("@") && next.age >= 18;
//     return { ...updates, isValid };
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Form Demo</CardTitle>
//         <CardDescription>Wrapped state with validation</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <Input
//           placeholder="Username"
//           value={username}
//           onChange={(e) =>
//             store.form.set(validateForm({ username: e.target.value }))
//           }
//         />
//         <Input
//           placeholder="Email"
//           value={email}
//           onChange={(e) => store.form.set(validateForm({ email: e.target.value }))}
//         />
//         <Input
//           type="number"
//           placeholder="Age"
//           value={age}
//           onChange={(e) =>
//             store.form.set(validateForm({ age: parseInt(e.target.value) || 0 }))
//           }
//         />
//         <div className="text-sm">
//           Form is {isValid ? "valid" : "invalid"}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Settings Demo
// const SettingsDemo: FC = () => {
//   const { notifications, fontSize, language } = store.settings();

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Settings Demo</CardTitle>
//         <CardDescription>Wrapped persisted state</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex items-center justify-between">
//           <span>Notifications</span>
//           <Switch
//             checked={notifications}
//             onCheckedChange={(checked) =>
//               store.settings.set({ notifications: checked })
//             }
//           />
//         </div>
//         <div className="space-y-2">
//           <div>Font Size: {fontSize}px</div>
//           <Input
//             type="range"
//             min="12"
//             max="24"
//             value={fontSize}
//             onChange={(e) =>
//               store.settings.set({ fontSize: parseInt(e.target.value) })
//             }
//           />
//         </div>
//         <Select
//           value={language}
//           onValueChange={(value) => store.settings.set({ language: value })}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select language" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="en">English</SelectItem>
//             <SelectItem value="es">Spanish</SelectItem>
//             <SelectItem value="fr">French</SelectItem>
//           </SelectContent>
//         </Select>
//       </CardContent>
//     </Card>
//   );
// };

// // Cart Demo
// const CartDemo: FC = () => {
//   const { items, total, recentlyViewed } = store.cart();

//   const addItem = (name: string, price: number) => {
//     const id = Date.now().toString();
//     store.cart.set({
//       items: [...items, { id, name, price, quantity: 1 }],
//       total: total + price,
//       lastUpdated: new Date().toISOString(),
//       recentlyViewed: [id, ...recentlyViewed.slice(0, 4)],
//     });
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Cart Demo</CardTitle>
//         <CardDescription>Complex state with selective persistence</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex gap-2">
//           <Button onClick={() => addItem("Product", 9.99)}>Add Item</Button>
//         </div>
//         <div className="space-y-2">
//           {items.map((item) => (
//             <div key={item.id} className="flex justify-between p-2 border rounded">
//               <span>{item.name}</span>
//               <span>${item.price}</span>
//             </div>
//           ))}
//         </div>
//         {/* <div className="font-bold">Total: ${total.toFixed(2)}</div> */}
//         <div className="text-sm text-muted-foreground">
//           Recently viewed items persist across sessions
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // Main Demo Component
// const StoreDemo: FC = () => {
//   return (
//     <div className="container py-8">
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-3xl font-bold">Store Demo</h1>
//           <p className="text-muted-foreground">
//             Demonstration of various store patterns and features
//           </p>
//         </div>
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <CounterDemo />
//           <ThemeDemo />
//           <TodoDemo />
//           <FormDemo />
//           <SettingsDemo />
//           <CartDemo />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoreDemo;
