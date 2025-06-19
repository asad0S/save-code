// کانفیگ Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwcxwlBGR57j0AU2WH23Wb9TDxLeEsX7A",
  authDomain: "otp-saver.firebaseapp.com",
  projectId: "otp-saver",
  storageBucket: "otp-saver.appspot.com",
  messagingSenderId: "392885457146",
  appId: "1:392885457146:web:b79b5ce8f400f4c25af943",
  measurementId: "G-RCKDP53SS5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const saveBtn = document.querySelector('.save');
const inputs = document.querySelectorAll('.code');
const saveList = document.querySelector('.save-list');

// قالب زمان به صورت AM/PM
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // ساعت ۰ را ۱۲ کن
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes + ' ' + ampm;
}

// بروزرسانی شماره ردیف ها
function updateNumbers() {
  const rows = saveList.querySelectorAll('.code-row');
  rows.forEach((row, index) => {
    const numberDiv = row.querySelector('.row-number');
    numberDiv.textContent = index + 1;
  });
}

// بارگذاری داده ها از Firestore و نمایش
function loadData() {
  saveList.querySelectorAll('.code-row').forEach(e => e.remove()); // حذف ردیف های قبلی

  db.collection("codes").orderBy("savedAt", "desc").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      addRowToDOM(data, doc.id);
    });
    updateNumbers();
  });
}

// اضافه کردن یک ردیف جدید به DOM
function addRowToDOM(data, docId) {
  const row = document.createElement('div');
  row.className = 'code-row';

  const numberDiv = document.createElement('div');
  numberDiv.className = 'row-number';

  const otpDiv = document.createElement('div');
  otpDiv.className = 'otp-code';
  otpDiv.textContent = data.otp;

  const code4Div = document.createElement('div');
  code4Div.className = 'code-4';
  code4Div.textContent = data.code4;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'save-time';
  timeDiv.textContent = formatAMPM(data.savedAt.toDate());

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'حذف';

  deleteBtn.addEventListener('click', () => {
    db.collection("codes").doc(docId).delete().then(() => {
      row.remove();
      updateNumbers();
    });
  });

  row.appendChild(numberDiv);
  row.appendChild(otpDiv);
  row.appendChild(code4Div);
  row.appendChild(timeDiv);
  row.appendChild(deleteBtn);

  saveList.appendChild(row);
}

saveBtn.addEventListener('click', () => {
  const otp = inputs[0].value.trim();
  const code4 = inputs[1].value.trim();

  if (!otp || !code4) {
    alert('لطفاً هر دو کد را وارد کنید!');
    return;
  }

  // ذخیره در Firestore
  db.collection("codes").add({
    otp: otp,
    code4: code4,
    savedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    inputs.forEach(input => input.value = '');
    loadData();
  })
  .catch((error) => {
    alert('خطا در ذخیره: ' + error.message);
  });
});

// بارگذاری اولیه داده‌ها هنگام شروع
window.onload = loadData;
