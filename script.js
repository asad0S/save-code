// Firebase Config and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyDwcxwlBGR57j0AU2WH23Wb9TDxLeEsX7A",
  authDomain: "otp-saver.firebaseapp.com",
  projectId: "otp-saver",
  storageBucket: "otp-saver.appspot.com",
  messagingSenderId: "392885457146",
  appId: "1:392885457146:web:b79b5ce8f400f4c25af943",
  measurementId: "G-RCKDP53SS5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const saveBtn = document.querySelector('.save');
const inputs = document.querySelectorAll('.code');
const saveList = document.querySelector('.save-list');

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes + ' ' + ampm;
}

saveBtn.addEventListener('click', () => {
  const otp = inputs[0].value.trim();
  const code4 = inputs[1].value.trim();

  if (otp && code4) {
    db.collection('codes').add({
      otp: otp,
      code4: code4,
      savedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      inputs.forEach(input => input.value = '');
    }).catch(err => console.error('خطا در ذخیره:', err.message));
  }
});

function renderData(docs) {
  const existingRows = saveList.querySelectorAll('.code-row');
  existingRows.forEach(row => saveList.removeChild(row));

  docs.forEach((docSnapshot, index) => {
    const data = docSnapshot.data();

    const row = document.createElement('div');
    row.className = 'code-row';

    const numberDiv = document.createElement('div');
    numberDiv.className = 'row-number';
    numberDiv.textContent = index + 1;

    const otpDiv = document.createElement('div');
    otpDiv.className = 'otp-code';
    otpDiv.textContent = data.otp;

    const copyOtpBtn = document.createElement('button');
    copyOtpBtn.textContent = 'کپی';
    copyOtpBtn.style.marginRight = '5px';
    copyOtpBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(data.otp).catch(() => {});
      // علامت زدن اینکه کد کپی شده
      db.collection('codes').doc(docSnapshot.id).update({
        copied: true,
        copiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    const otpWrapper = document.createElement('div');
    otpWrapper.style.display = 'flex';
    otpWrapper.style.alignItems = 'center';
    otpWrapper.appendChild(copyOtpBtn);
    otpWrapper.appendChild(otpDiv);

    const code4Div = document.createElement('div');
    code4Div.className = 'code-4';
    code4Div.textContent = data.code4;

    const copyCode4Btn = document.createElement('button');
    copyCode4Btn.textContent = 'کپی';
    copyCode4Btn.style.marginRight = '5px';
    copyCode4Btn.addEventListener('click', () => {
      navigator.clipboard.writeText(data.code4).catch(() => {});
      // علامت زدن اینکه کد کپی شده
      db.collection('codes').doc(docSnapshot.id).update({
        copied: true,
        copiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    const code4Wrapper = document.createElement('div');
    code4Wrapper.style.display = 'flex';
    code4Wrapper.style.alignItems = 'center';
    code4Wrapper.appendChild(copyCode4Btn);
    code4Wrapper.appendChild(code4Div);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'save-time';
    const savedAt = data.savedAt ? data.savedAt.toDate() : new Date();
    timeDiv.textContent = formatAMPM(savedAt);

    // نمایش علامت کپی شده (مثلاً متن قرمز)
    const copiedInfo = document.createElement('div');
    copiedInfo.style.color = 'red';
    copiedInfo.style.marginRight = '10px';
    copiedInfo.textContent = data.copied ? 'کپی شده توسط کسی' : '';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'حذف';
    deleteBtn.addEventListener('click', () => {
      db.collection('codes').doc(docSnapshot.id).delete();
    });

    row.appendChild(numberDiv);
    row.appendChild(otpWrapper);
    row.appendChild(code4Wrapper);
    row.appendChild(timeDiv);
    row.appendChild(copiedInfo);
    row.appendChild(deleteBtn);

    saveList.appendChild(row);
  });
}

// حذف کدهای بالای ۳ ساعت
function deleteOldCodes() {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  db.collection('codes')
    .where('savedAt', '<', threeHoursAgo)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        db.collection('codes').doc(doc.id).delete();
      });
    })
    .catch(err => console.error('خطا در حذف کدهای قدیمی:', err));
}

// هر 5 دقیقه یک بار اجرا شود
setInterval(deleteOldCodes, 5 * 60 * 1000);
deleteOldCodes();

db.collection('codes').orderBy('savedAt', 'desc').onSnapshot(snapshot => {
  renderData(snapshot.docs.reverse());
});
