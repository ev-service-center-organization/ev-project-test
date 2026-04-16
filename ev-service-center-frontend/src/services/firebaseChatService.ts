import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, Timestamp 
} from "firebase/firestore";

// --- CÁC KIỂU DỮ LIỆU ---
export interface ChatRoom {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: number;
  senderRole: "ADMIN" | "USER"; 
  senderName?: string;
  createdAt: Timestamp;
}

// --- 1. GỬI TIN NHẮN (Full Logic) ---
export const sendMessage = async (roomId: string, text: string, sender: { id: number, role: string, name: string, email: string }) => {
  if (!roomId || !text.trim()) return;

  const normalizedRole = sender.role?.toString().toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  try {
    // A. Lưu tin nhắn vào collection con
    await addDoc(collection(db, "chats", roomId, "messages"), {
      text,
      senderId: sender.id,
      senderRole: normalizedRole,
      senderName: sender.name,
      createdAt: serverTimestamp(),
    });

    // B. Cập nhật thông tin phòng chat (để Admin thấy)
    const roomData: any = {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      roomId: roomId
    };

    if (normalizedRole === "USER") {
      roomData.customerName = sender.name;
      roomData.customerEmail = sender.email;
    }

    await setDoc(doc(db, "chats", roomId), roomData, { merge: true });
    
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    throw error;
  }
};

// --- 2. LẮNG NGHE DANH SÁCH PHÒNG (Cho Admin) ---
export const subscribeToChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  console.log("📡 Đang gọi Firestore để lấy danh sách phòng..."); // Log 1

  const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    console.log("🔥 Firestore trả về:", snapshot.size, "phòng chat"); // Log 2

    const rooms = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(" - Phòng:", doc.id, data); // Log 3: In chi tiết từng phòng
      return {
        id: doc.id,
        ...data
      } as ChatRoom;
    });
    
    callback(rooms);
  }, (error) => {
    console.error("❌ LỖI FIRESTORE:", error); // Log 4: Nếu có lỗi đỏ thì in ra đây
  });
};

// --- 3. LẮNG NGHE TIN NHẮN TRONG PHÒNG (Cho cả Admin & Khách) ---
// 👇 Đây là hàm mà bạn đang bị báo lỗi thiếu này!
export const subscribeToMessages = (roomId: string, callback: (msgs: ChatMessage[]) => void) => {
  if (!roomId) return () => {};

  const q = query(
    collection(db, "chats", roomId, "messages"), 
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    callback(messages);
  });
};