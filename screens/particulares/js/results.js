const result = JSON.parse(localStorage.getItem("cv_result"));

if (!result) {
  window.location.href = "home.html";
}

document.getElementById("role").innerText = result.role;
document.getElementById("seniority").innerText = result.seniority;

const top3List = document.getElementById("top3");

result.role_details.top3.forEach(item => {
  const li = document.createElement("li");
  li.innerText = `${item.job_title} (${(item.prob * 100).toFixed(1)}%)`;
  top3List.appendChild(li);
});
