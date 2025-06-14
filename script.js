const saveBtn = document.querySelector('.save');
const inputs = document.querySelectorAll('.code');
const saveList = document.querySelector('.save-list');

function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // ساعت ۰ را ۱۲ کن
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return hours + ':' + minutes + ' ' + ampm;
}

function updateNumbers() {
  const rows = saveList.querySelectorAll('.code-row');
  rows.forEach((row, index) => {
    const numberDiv = row.querySelector('.row-number');
    numberDiv.textContent = index + 1;
  });
}

saveBtn.addEventListener('click', () => {
  const otp = inputs[0].value.trim();
  const code4 = inputs[1].value.trim();

  if (otp && code4) {
    const row = document.createElement('div');
    row.className = 'code-row';

    // شماره ردیف
    const numberDiv = document.createElement('div');
    numberDiv.className = 'row-number';

    // کد OTP
    const otpDiv = document.createElement('div');
    otpDiv.className = 'otp-code';
    otpDiv.textContent = otp;

    // کد ۴ رقمی
    const code4Div = document.createElement('div');
    code4Div.className = 'code-4';
    code4Div.textContent = code4;

    // زمان ذخیره
    const timeDiv = document.createElement('div');
    timeDiv.className = 'save-time';
    timeDiv.textContent = formatAMPM(new Date());

    // دکمه حذف
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'حذف';
    deleteBtn.className = 'delete-btn';

    deleteBtn.addEventListener('click', () => {
      saveList.removeChild(row);
      updateNumbers();
    });

    // اضافه کردن به ردیف
    row.appendChild(numberDiv);
    row.appendChild(otpDiv);
    row.appendChild(code4Div);
    row.appendChild(timeDiv);
    row.appendChild(deleteBtn);

    saveList.appendChild(row);
    updateNumbers();

    inputs.forEach(input => input.value = '');
  } else {
    alert('لطفاً هر دو کد را وارد کنید!');
  }
});
