import streamlit as st

st.title("نظام محاكاة إحالة المرضى - HakeemAI")

# --- قاعدة بيانات المرافق الصحية الواقعية لمحافظة حجة --- 
facilities = [
    {"name": "مركز عاهم الصحي", "location": "كشر", "risk_reduction": 5, "distance_to_next": 40},
    {"name": "مستشفى عبس العام", "location": "عبس", "risk_reduction": 15, "distance_to_next": 113},
    {"name": "هيئة مستشفى الجمهوري", "location": "مدينة حجة", "risk_reduction": 15, "distance_to_next": 123},
    {"name": "مستشفى جامعة الكويت", "location": "صنعاء", "risk_reduction": 35, "distance_to_next": 0},
]

# --- إعداد بيانات الاستشارات عن بعد --- 
telemedicine_reduction = 10  # النسبة التي تقلل الخطر قبل أي محطة 

# --- إدخال بيانات الحالة --- 
st.subheader("إدخال بيانات الحالة")
patient_name = st.text_input("اسم المريض", "مريض 1")
initial_risk = st.slider("نسبة الخطر (%)", 0, 100, 90)

# --- بدء المحاكاة --- 
st.subheader("نتائج المحاكاة")
current_risk = initial_risk
st.write(f"🔹 الحالة: {patient_name}")
st.write(f"الخطر الأصلي: {current_risk}%")

# تطبيق الاستشارات عن بعد 
current_risk = max(current_risk - telemedicine_reduction, 0)
st.write(f"بعد الاستشارات عن بعد: {current_risk}%")

# المرور بالمرافق الصحية 
for i, f in enumerate(facilities):
    next_distance = f.get("distance_to_next", 0)
    new_risk = max(current_risk - f["risk_reduction"], 0)
    st.write(f"🏥 الانتقال إلى {f["name"]} ({f["location"]})")
    st.write(f"- المسافة إلى هذه المحطة: {next_distance} كم")
    st.write(f"- الخطر: {current_risk}% → {new_risk}%")
    current_risk = new_risk

st.write(f"✅ الخطر النهائي بعد كل المحطات: {current_risk}%")
st.write("الحالة مستقرة إذا وصل المريض إلى المستشفى الأخير.")

# --- خيارات إضافية للفيديو --- 
st.subheader("خطة الرحلة التفاعلية")
st.table([{
    "المحطة": f["name"],
    "الموقع": f["location"],
    "تقليل الخطر (%)": f["risk_reduction"],
    "المسافة إلى المحطة التالية (كم)": f["distance_to_next"]
} for f in facilities])
