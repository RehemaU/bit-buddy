<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from './firebase';
import { 
  ref as dbRef, 
  set, 
  onValue, 
  serverTimestamp, 
  onDisconnect, 
  remove 
} from "firebase/database";

/**
 * 1. 유저 식별 로직
 * localStorage를 활용해 브라우저별 고유 ID를 부여합니다.
 */
const getUserId = () => {
  let id = localStorage.getItem('my_presence_id');
  if (!id) {
    id = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('my_presence_id', id);
  }
  return id;
};

const userId = getUserId();
const isMoving = ref(false);
const allUsers = ref({});
let timer = null;

/**
 * 2. 상태 업데이트 함수
 */
const updatePresence = (moving) => {
  isMoving.value = moving;
  const userStatusRef = dbRef(db, `presence/${userId}`);
  
  // 데이터가 유실되지 않도록 set으로 상태 전송
  set(userStatusRef, {
    active: moving,
    lastChanged: serverTimestamp(),
    id: userId // 리스트 출력 편의를 위해 ID 포함
  });
};

/**
 * 3. 입력 감지 핸들러
 */
const handleActivity = () => {
  if (!isMoving.value) updatePresence(true);
  
  clearTimeout(timer);
  timer = setTimeout(() => {
    updatePresence(false);
  }, 2000); // 2초간 움직임이 없으면 '정지'로 변경
};

onMounted(() => {
  // A. 활동 감지 리스너 등록
  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keydown', handleActivity);

  // B. Firebase 연결 상태 모니터링 및 onDisconnect 설정
  const connectedRef = dbRef(db, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      const userStatusRef = dbRef(db, `presence/${userId}`);

      // [핵심] 서버와 연결이 끊기면(창 닫기 등) 즉시 데이터 삭제 예약
      onDisconnect(userStatusRef).remove();

      // 연결 성공 시 초기 상태를 '정지'로 설정
      updatePresence(false);
    }
  });

  // C. 실시간 전체 유저 목록 동기화
  const presenceRef = dbRef(db, 'presence');
  onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    allUsers.value = data || {};
  });

  // D. 브라우저 종료 시 명시적으로 삭제 시도 (보험)
  window.addEventListener('beforeunload', () => {
    const userStatusRef = dbRef(db, `presence/${userId}`);
    remove(userStatusRef);
  });
});

onUnmounted(() => {
  // 메모리 누수 방지를 위한 리스너 해제
  window.removeEventListener('mousemove', handleActivity);
  window.removeEventListener('keydown', handleActivity);
});
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>실시간 활동 모니터</h1>
      <div class="my-status">
        내 ID: <code>{{ userId }}</code> | 
        상태: <span :class="{ 'active-text': isMoving }">
          {{ isMoving ? '움직이는 중! 🏃' : '정지 상태 🛑' }}
        </span>
      </div>
    </div>
    
    <hr />

    <div class="user-list">
      <h2>접속 중인 유저 ({{ Object.keys(allUsers).length }}명)</h2>
      <transition-group name="list">
        <div v-for="(userData, id) in allUsers" :key="id" class="user-card" :class="{ 'is-me': id === userId }">
          <div class="user-info">
            <span class="icon">{{ id === userId ? '🙋‍♂️' : '👤' }}</span>
            <span class="name">{{ id === userId ? '나 (You)' : '유저 ' + id }}</span>
          </div>
          <div class="status-badge" :class="{ 'moving': userData.active }">
            {{ userData.active ? '움직임' : '정지' }}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.container { padding: 20px; max-width: 500px; margin: 0 auto; font-family: 'Pretendard', sans-serif; }
.header { text-align: center; margin-bottom: 20px; }
.my-status { background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 0.9rem; }
.active-text { color: #2ecc71; font-weight: bold; }

.user-list { margin-top: 20px; }
.user-card { 
  display: flex; justify-content: space-between; align-items: center;
  margin: 10px 0; padding: 15px; border: 1px solid #eee; border-radius: 10px;
  transition: all 0.3s ease;
}
.is-me { border-color: #3498db; background-color: #ebf5fb; }

.status-badge { 
  padding: 4px 12px; border-radius: 20px; background: #95a5a6; color: white; font-size: 0.8rem;
}
.status-badge.moving { background: #2ecc71; animation: pulse 1s infinite; }

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 리스트 애니메이션 */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }
</style>