import re
from collections import defaultdict
from app.db import functional_ranges_collection, supplements_collection
from fpdf import FPDF
import io
import datetime

def clean_text(text):
    if not text:
        return ""
    # Replace curly quotes and en dash with ASCII equivalents
    return (
        text.replace("‘", "'")
            .replace("’", "'")
            .replace("“", '"')
            .replace("”", '"')
            .replace("–", "-")
    )

def create_lab_report_pdf(report):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- Logo ---
    try:
        pdf.image("logo.png", x=10, y=8, w=30)
    except Exception:
        pass

    # --- Date ---
    today_str = datetime.datetime.now().strftime("%B %d, %Y")
    pdf.set_font("Arial", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Date: {today_str}", ln=True, align="R")
    pdf.set_text_color(0, 0, 0)

    # --- Main Title ---
    pdf.set_font("Arial", "B", 20)
    pdf.set_text_color(40, 80, 160)
    pdf.cell(0, 18, clean_text("Holistic Health Route - Lab Report"), ln=True, align="C")
    pdf.set_font("Arial", size=12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, clean_text("Contact: support@holistichealthroute.com"), ln=True, align="C")
    pdf.ln(2)

    # --- Disclaimer (all paragraphs in one fill, lighter gray) ---
    pdf.set_fill_color(240, 240, 255)
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(40, 80, 160)
    pdf.cell(0, 10, "Disclaimer", ln=True, fill=True)
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(120, 120, 120)
    pdf.multi_cell(0, 6, clean_text(
        "This report is educational only. It highlights lab patterns for awareness and provides guidance for general support. "
        "It does not diagnose, treat, or give medical advice. Always consult your healthcare provider for personal care.\n\n"
        "Some labs may use different measurement units than what we reference here. If that happens, the ranges in this report may not match perfectly. "
        "Always compare your results with the units on your lab report and check with your licensed provider if you have questions.\n\n"
        "This tool is not for urgent or emergency use. If you have severe, worsening, or concerning symptoms, call your provider or emergency services immediately."
    ), fill=True)
    pdf.ln(6)

    # --- How to Use This Report ---
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(40, 80, 160)
    pdf.cell(0, 10, clean_text("How to Use This Report:"), ln=True)
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, 6, clean_text(
        "This report is meant to guide you step by step. Here’s how to use it:\n"
        "1. Start with the Always Address section.\n"
        "These are areas your body always needs support with, no matter what else is going on. Review the recommended module and follow the guidance inside the membership portal for more details.\n"
        "2. Then focus on the Current Priority.\n"
        "This is the single most important area for your body right now. Work on this first before moving to anything else.\n"
        "3. Visit the recommended module for each marker.\n"
        "Inside the membership portal, each module has the most up-to-date information on food, lifestyle, and supplement support for that marker.\n"
        "4. Take it step by step.\n"
        "Don’t try to do everything at once. Start with the Always Address items, then move on to the Current Priority.\n"
        "5. Re-check your labs.\n"
        "Retest in 6–8 weeks to track progress and see how your body is responding."
    ))
    pdf.ln(6)

    # --- Always Address Section ---
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(40, 80, 160)
    pdf.cell(0, 10, clean_text("Always Address"), ln=True)
    pdf.ln(2)
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(0, 0, 0)
    for section in report.get("always_address", []):
        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(40, 80, 160)
        pdf.cell(0, 7, clean_text(section.get("section", "")), ln=True)
        pdf.set_font("Arial", size=10)
        pdf.set_text_color(0, 0, 0)
        if section.get("results"):
            add_marker_table(pdf, section["results"])
            # Deduplicate supplements by name+dosage+link
            seen_supps = set()
            for marker in section["results"]:
                if marker.get("supplements"):
                    for supp in marker["supplements"]:
                        key = (supp['name'], supp['dosage'], supp['productLink'])
                        if key in seen_supps:
                            continue
                        seen_supps.add(key)
                        pdf.set_text_color(60, 60, 60)  # Supplement name: dark gray
                        pdf.cell(0, 6, clean_text(f"Recommended: {supp['name']} - {supp['dosage']}"), ln=True)
                        pdf.set_text_color(0, 0, 255)  # Link: blue
                        pdf.set_font("Arial", "U", 10)
                        pdf.cell(0, 6, clean_text(f"Link: {supp['productLink']}"), ln=True, link=supp['productLink'])
                        pdf.set_font("Arial", size=10)
                        pdf.set_text_color(0, 0, 0)
        if section.get("message"):
            pdf.set_text_color(60, 60, 60)  # User message: dark gray
            pdf.multi_cell(0, 6, clean_text(section["message"]))
            pdf.set_text_color(0, 0, 0)
        pdf.ln(4)
    pdf.ln(6)

    # --- Priority Focus Section ---
    priority = report.get("priority_focus")
    if priority and priority.get("results"):
        pdf.set_font("Arial", "B", 14)
        pdf.set_text_color(40, 80, 160)
        pdf.cell(0, 10, clean_text("Markers We Are Prioritizing"), ln=True)
        pdf.ln(2)
        pdf.set_font("Arial", size=10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 6, clean_text(f"Priority: {priority.get('priority', '')}"), ln=True)
        add_marker_table(pdf, priority["results"])
        # Deduplicate supplements by name+dosage+link
        seen_supps = set()
        for marker in priority["results"]:
            if marker.get("supplements"):
                for supp in marker["supplements"]:
                    key = (supp['name'], supp['dosage'], supp['productLink'])
                    if key in seen_supps:
                        continue
                    seen_supps.add(key)
                    pdf.set_text_color(60, 60, 60)  # Supplement name: dark gray
                    pdf.cell(0, 6, clean_text(f"Recommended: {supp['name']} - {supp['dosage']}"), ln=True)
                    pdf.set_text_color(0, 0, 255)  # Link: blue
                    pdf.set_font("Arial", "U", 10)
                    pdf.cell(0, 6, clean_text(f"Link: {supp['productLink']}"), ln=True, link=supp['productLink'])
                    pdf.set_font("Arial", size=10)
                    pdf.set_text_color(0, 0, 0)
        if priority.get("message"):
            pdf.set_text_color(60, 60, 60)  # User message: dark gray
            pdf.multi_cell(0, 6, clean_text(priority["message"]))
            pdf.set_text_color(0, 0, 0)
        pdf.ln(4)
    pdf.ln(6)

    # --- Other Markers Out of Range ---
    others = report.get("other_out_of_range", [])
    if others:
        pdf.set_font("Arial", "B", 14)
        pdf.set_text_color(40, 80, 160)
        pdf.cell(0, 10, clean_text("Other Markers Out of Range"), ln=True)
        pdf.ln(2)
        pdf.set_font("Arial", size=10)
        pdf.set_text_color(0, 0, 0)
        add_marker_table(pdf, others)
        pdf.set_text_color(60, 60, 60)  # User message: dark gray
        pdf.multi_cell(0, 6, clean_text(report.get("note", "")))
        pdf.set_text_color(0, 0, 0)
        pdf.ln(4)
    pdf.ln(6)

    # --- Re-check Window ---
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(40, 80, 160)
    pdf.multi_cell(0, 10, clean_text(f"Re-check Window: {report.get('recheck_window', '')}"))
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)

    # --- Safety Note ---
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(160, 40, 40)
    pdf.multi_cell(0, 6, clean_text(report.get("safety_note", "")))
    pdf.set_text_color(0, 0, 0)

    pdf_bytes = pdf.output(dest='S').encode('latin1', 'replace')
    return io.BytesIO(pdf_bytes)

def add_marker_table(pdf, markers):
    # Determine if "Range" column should be shown
    show_range = any(
        (marker.get("low") not in (None, "-", "", "None") or marker.get("high") not in (None, "-", "", "None"))
        for marker in markers
    )
    # Table headers
    pdf.set_font("Arial", "B", 10)
    pdf.set_text_color(40, 80, 160)
    col_widths = [40, 25, 25, 25]
    if show_range:
        col_widths.append(40)
    table_width = sum(col_widths)
    page_width = 210  # A4 width in mm
    left_margin = (page_width - table_width) / 2
    pdf.set_x(left_margin)
    pdf.cell(col_widths[0], 8, "Marker", border=1, align="C")
    pdf.cell(col_widths[1], 8, "Value", border=1, align="C")
    pdf.cell(col_widths[2], 8, "Unit", border=1, align="C")
    pdf.cell(col_widths[3], 8, "Status", border=1, align="C")
    if show_range:
        pdf.cell(col_widths[4], 8, "Range", border=1, align="C")
    pdf.ln()
    # Table rows
    pdf.set_font("Arial", size=10)
    pdf.set_text_color(0, 0, 0)
    for marker in markers:
        pdf.set_x(left_margin)
        pdf.cell(col_widths[0], 8, str(marker.get("marker", "")), border=1, align="C")
        pdf.cell(col_widths[1], 8, str(marker.get("value", "")), border=1, align="C")
        pdf.cell(col_widths[2], 8, str(marker.get("unit", "")), border=1, align="C")
        pdf.cell(col_widths[3], 8, str(marker.get("status", "")), border=1, align="C")
        if show_range:
            low = marker.get("low", "-")
            high = marker.get("high", "-")
            range_str = f"{low} - {high}" if (low not in ("-", "", None, "None") or high not in ("-", "", None, "None")) else "-"
            pdf.cell(col_widths[4], 8, range_str, border=1, align="C")
        pdf.ln()
    pdf.ln(2)

async def generate_medical_report(request):
    user_data = request.dict()
    lab_reports = user_data.get("lab_reports", {}) or {}
    gender_at_birth = user_data.get("gender_at_birth") or user_data.get("gender")
    menstruation_status = user_data.get("menstruation_status") or "None"
    bowel = user_data.get("bowel_movements")

    # Result buckets
    always_address = []
    other_out_of_range = []

    # --- Load functional ranges from DB and index by marker (and normalized marker) ---
    ranges_by_marker = defaultdict(list)
    ranges_by_norm = defaultdict(list)

    cursor = functional_ranges_collection.find({})
    async for doc in cursor:
        marker_name = doc.get("marker")
        if marker_name:
            ranges_by_marker[marker_name].append(doc)
            norm = re.sub(r'[^a-z0-9]', '', marker_name.lower())
            ranges_by_norm[norm].append(doc)

    def normalize_marker(name: str):
        if not name:
            return ""
        return re.sub(r'[^a-z0-9]', '', name.lower())

    def find_best_range_doc(marker: str):
        """
        Find the best matching functional range doc for this user.
        Priority:
         1) exact marker name match with gender & menstruation_status
         2) exact marker name match with gender
         3) normalized marker name matches
         4) fallback to any doc for marker
        Returns None if none found.
        """
        candidates = ranges_by_marker.get(marker, [])
        # try normalized key lookup if no direct candidates
        if not candidates:
            candidates = ranges_by_norm.get(normalize_marker(marker), [])

        if not candidates:
            return None

        # scoring function
        def score(doc):
            s = 0
            doc_gender = str(doc.get("gender") or "").lower()
            doc_men = str(doc.get("menstruation_status") or "").lower()
            if doc_gender and gender_at_birth and doc_gender == gender_at_birth.lower():
                s += 4
            # prefer docs that have "None" for menstruation_status when user's is None, else exact match
            if doc_men and menstruation_status and doc_men == menstruation_status.lower():
                s += 2
            # prefer docs that specify a measurementUnits (slightly)
            if doc.get("measurementUnits"):
                s += 1
            return s

        best = max(candidates, key=score)
        return best

    async def fetch_supplements(supp_ids):
        out = []
        if not supp_ids:
            return out
        for sid in supp_ids:
            if not sid:
                continue
            supp = await supplements_collection.find_one({"_id": sid})
            if supp:
                # normalize expected fields
                out.append({
                    "id": supp.get("_id"),
                    "name": supp.get("name"),
                    "dosage": supp.get("dosage"),
                    "productLink": supp.get("productLink"),
                    "description": supp.get("description"),
                })
        return out

    def compute_deviation(value, low, high):
        """Normalized deviation relative to range width (so different markers comparable)."""
        try:
            width = float(high) - float(low)
            if width == 0:
                width = 1.0
            if value < low:
                return (low - value) / width
            elif value > high:
                return (value - high) / width
            else:
                return 0.0
        except Exception:
            return 0.0

    async def evaluate_marker(marker_name, value, unit):
        """
        Return dict:
         {
           "marker": marker_name,
           "value": value,
           "unit": unit,
           "status": "normal"|"low"|"high"|"unknown"|"unit_mismatch",
           "low": <functionalLow or None>,
           "high": <functionalHigh or None>,
           "deviation": float,
           "supplements": [supplement objects]
         }
        """
        doc = find_best_range_doc(marker_name)
        if not doc:
            return {"marker": marker_name, "value": value, "unit": unit, "status": "unknown"}

        doc_unit = doc.get("measurementUnits")
        # If units mismatch and we don't have conversion logic, mark unknown (safe)
        if doc_unit and unit and unit.strip().lower() != doc_unit.strip().lower():
            return {
                "marker": marker_name,
                "value": value,
                "unit": unit,
                "status": "unknown",
                "reason": "unit_mismatch",
                "expected_unit": doc_unit
            }

        low = doc.get("functionalLow")
        high = doc.get("functionalHigh")
        try:
            if low is None or high is None:
                return {"marker": marker_name, "value": value, "unit": unit, "status": "unknown", "reason": "no_range"}
            v = float(value)
            low_f = float(low)
            high_f = float(high)
        except Exception:
            return {"marker": marker_name, "value": value, "unit": unit, "status": "unknown", "reason": "bad_values"}

        if v < low_f:
            status = "low"
        elif v > high_f:
            status = "high"
        else:
            status = "normal"

        deviation = compute_deviation(v, low_f, high_f)
        # get suggested supplements from doc
        supp_field = doc.get("ifLow") if status == "low" else doc.get("ifHigh")
        supp_ids = supp_field.get("supplements") if isinstance(supp_field, dict) else None
        supplements = await fetch_supplements(supp_ids or [])
        return {
            "marker": marker_name,
            "value": v,
            "unit": unit,
            "status": status,
            "low": low_f,
            "high": high_f,
            "deviation": deviation,
            "supplements": supplements
        }

    # -----------------------
    # --- Always Address ---
    # -----------------------

    # 1) Bowel Movements
    if bowel in ["No", "Sometimes", "no", "sometimes"]:
        always_address.append({
            "section": "Bowel support",
            "message": "Bowel support is needed. Review the ‘Why Bowel Movements Matter’ module inside the membership portal."
        })

    # 2) RBC group (RBC, Hemoglobin, Hematocrit, MCV, MCH, MCHC, RDW)
    rbc_markers = ["RBC", "Hemoglobin", "Hematocrit", "MCV", "MCH", "MCHC", "RDW"]
    rbc_out = []
    cbc_panel = lab_reports.get("CBC_with_Differential", {}) or {}
    for m in rbc_markers:
        if m in cbc_panel:
            val = cbc_panel[m].get("value")
            unit = cbc_panel[m].get("unit")
            res = await evaluate_marker(m, val, unit)
            if res.get("status") in ("low", "high"):
                rbc_out.append(res)
    if rbc_out:
        always_address.append({
            "section": "RBC Markers",
            "results": rbc_out,
            "message": "Methylation or iron is needed. Review the ‘Red Blood Cells’ module inside the membership portal to help determine which (or if both) is needed."
        })

    # 3) Platelets
    if "Platelets" in cbc_panel:
        pl_val = cbc_panel["Platelets"].get("value")
        pl_unit = cbc_panel["Platelets"].get("unit")
        pl_res = await evaluate_marker("Platelets", pl_val, pl_unit)
        if pl_res.get("status") in ("low", "high"):
            always_address.append({
                "section": "Platelets",
                "results": [pl_res],
                "message": "Circulation support is needed. Review the ‘Platelet’ module inside the membership portal."
            })

    # 4) Cholesterol Pattern (always evaluate when lipid panel present)
    lipid = lab_reports.get("Lipid_Panel")
    if lipid:
        try:
            tc = float(lipid.get("Total_Cholesterol", {}).get("value"))
            tg = float(lipid.get("Triglycerides", {}).get("value"))
            hdl = float(lipid.get("HDL", {}).get("value"))
            # Rule: Triglycerides approximately 1/2 of Total Cholesterol -> TC ≈ 2 * TG
            # Acceptable 20% range: TC between 1.6*TG and 2.4*TG
            tc_ok = (1.6 * tg) <= tc <= (2.4 * tg) if tg != 0 else True
            # HDL approximately 1/2 of Triglycerides -> TG ≈ 2 * HDL
            tg_ok = (1.6 * hdl) <= tg <= (2.4 * hdl) if hdl != 0 else True
            if not (tc_ok and tg_ok):
                always_address.append({
                    "section": "Cholesterol Pattern",
                    "results": [
                        {"marker": "Total_Cholesterol", "value": tc, "unit": lipid.get("Total_Cholesterol", {}).get("unit")},
                        {"marker": "Triglycerides", "value": tg, "unit": lipid.get("Triglycerides", {}).get("unit")},
                        {"marker": "HDL", "value": hdl, "unit": lipid.get("HDL", {}).get("unit")},
                    ],
                    "message": "Your cholesterol pattern suggests deeper imbalance. Focus on your recommended food plan, balanced blood sugar, and bringing your markers into their functional ranges. Re-check in 6–8 weeks."
                })
        except Exception:
            # ignore calculation if any missing or bad formatting
            pass
    else:
        # Not required to add message when missing; spec wants cholesterol pattern flagged only when present.

        pass

    # 5) Vitamin D
    vit_panel = lab_reports.get("Vitamin_D_25_Hydroxy")
    if vit_panel and "25_Hydroxy_Vitamin_D" in vit_panel:
        vd = vit_panel["25_Hydroxy_Vitamin_D"]
        vd_val = vd.get("value")
        vd_unit = vd.get("unit")
        vd_res = await evaluate_marker("25_Hydroxy_Vitamin_D", vd_val, vd_unit)
        if vd_res.get("status") in ("low", "high"):
            always_address.append({
                "section": "Vitamin D",
                "results": [vd_res],
                "message": "Immune and hormone support is needed. Review the ‘Vitamin D’ module inside the membership portal."
            })
    else:
        always_address.append({
            "section": "Vitamin D",
            "message": "Vitamin D not provided. You may want to check your level. You can ask your provider or order a 25-Hydroxy Vitamin D test."
        })

    # -----------------------
    # --- Priority Engine ---
    # -----------------------

    # Priority groups (ordered). Use canonical marker strings that match the lab input when possible.
    top_priority_markers = ["Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils", "Globulin", "Total_Protein", "Total Protein"]
    second_priority_markers = ["Sodium", "Potassium", "Magnesium"]
    third_priority_markers = ["Glucose", "Ferritin", "Iron", "TIBC"]
    fourth_priority_markers = ["AST_SGOT", "ALT_SGPT", "AST", "ALT", "BUN", "Creatinine"]
    fifth_priority_markers = ["TSH", "Free_T3", "Free_T4", "Reverse_T3", "T3", "T4", "Anti_TPO"]

    # mapping of marker -> user message (per spec)
    user_messages_map = {
        # Top Priority
        "Neutrophils": "Specific immune support is needed. Review the ‘Neutrophils’ module inside the membership portal.",
        "Lymphocytes": "Specific immune support is needed. Review the ‘Lymphocytes’ module inside the membership portal.",
        "Monocytes": "Drainage support is needed. Review the ‘Monocytes’ module inside the membership portal.",
        "Eosinophils": "Specific immune support is needed. Review the ‘Eosinophils’ module inside the membership portal.",
        "Basophils": "Specific immune support is needed. Review the ‘Basophils’ module inside the membership portal.",
        "Globulin": "Intestinal and protein support is needed. Review the ‘Leaky Gut & Protein Balance’ module inside the membership portal.",
        "Total_Protein": "Intestinal and protein support is needed. Review the ‘Leaky Gut & Protein Balance’ module inside the membership portal.",
        "Total Protein": "Intestinal and protein support is needed. Review the ‘Leaky Gut & Protein Balance’ module inside the membership portal.",

        # 2nd Priority
        "Sodium": "Adrenal and mineral support is needed. Review the ‘Adrenal Stress’ module inside the membership portal.",
        "Potassium": "Adrenal and mineral support is needed. Review the ‘Adrenal Stress’ module inside the membership portal.",
        "Magnesium": "Mineral balance is needed. Review the ‘Magnesium’ module inside the membership portal.",

        # 3rd Priority
        "Glucose": "Blood sugar balance is needed. Review the ‘Blood Sugar Balance’ module inside the membership portal.",
        "Ferritin": "Iron balance needs adjusted. Review the ‘Iron Panel’ module inside the membership portal.",
        "Iron": "Iron balance needs adjusted. Review the ‘Iron Panel’ module inside the membership portal.",
        "TIBC": "Iron balance needs adjusted. Review the ‘Iron Panel’ module inside the membership portal.",

        # 4th Priority
        "AST": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "AST_SGOT": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "ALT": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "ALT_SGPT": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "BUN_low": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "BUN_high": "Kidney function needs support. Review the ‘Kidney Stress’ module inside the membership portal.",
        "Creatinine_low": "Congested liver needs support. Review the ‘Liver Stress’ module inside the membership portal.",
        "Creatinine_high": "Kidney function needs support. Review the ‘Kidney Stress’ module inside the membership portal.",

        # 5th Priority (Thyroid)
        "TSH": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "Free_T3": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "Free_T4": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "Reverse_T3": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "T3": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "T4": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
        "Anti_TPO": "Thyroid balance needs support. Review the ‘Thyroid Health’ section inside the membership portal.",
    }

    # convenience to scan markers in lab_reports
    async def collect_out_of_range_for_list(marker_list):
        found = []
        for panel in lab_reports.values():
            for marker in marker_list:
                # attempt multiple possible keys (some labs use underscores or spaces / different capitalization)
                possible_keys = {marker, marker.replace(" ", "_"), marker.replace("_", " "), marker.replace(" ", ""), marker.replace("_", "")}
                for key in possible_keys:
                    if key in panel:
                        val = panel[key].get("value")
                        unit = panel[key].get("unit")
                        res = await evaluate_marker(marker, val, unit)
                        if res.get("status") in ("low", "high"):
                            found.append(res)
                        break  # found marker in this panel, don't check other possible key variants
        return found

    # Priority evaluation order
    priority_groups = [
        ("Top Priority", top_priority_markers),
        ("2nd Priority", second_priority_markers),
        ("3rd Priority", third_priority_markers),
        ("4th Priority", fourth_priority_markers),
        ("5th Priority", fifth_priority_markers),
    ]

    # Keep track of which markers were used in Always Address so we don't duplicate
    always_markers = set()
    for a in always_address:
        results = a.get("results") or []
        for r in results:
            always_markers.add(r.get("marker"))

    # Evaluate priorities in order, stop at first where we find out-of-range markers
    selected_priority = None
    selected_priority_results = []

    for pname, plist in priority_groups:
        group_out = await collect_out_of_range_for_list(plist)
        if not group_out:
            continue

        # Top Priority special rule: for "Differentials" only select the single one furthest from range
        if pname == "Top Priority":
            # extract differential subset
            differentials = [m for m in group_out if m["marker"] in ["Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils"]]
            if differentials:
                # pick single differential with largest deviation
                chosen = max(differentials, key=lambda x: x.get("deviation", 0.0))
                # create result for chosen
                chosen_marker = chosen["marker"]
                msg = user_messages_map.get(chosen_marker)
                # add supplements already present in chosen
                # priority result only contains the chosen differential
                selected_priority = {"priority": pname, "results": [chosen], "message": msg}
                # Other group_out items (including globulin/total protein) should be moved to other_out_of_range (per spec)
                # We'll let other_out_of_range be populated later below.
                break
            else:
                # no differentials out-of-range; use other top markers (e.g., Globulin, Total Protein)
                # include all of them as the group's out-of-range markers
                # attach messages per marker
                res_with_msgs = []
                for m in group_out:
                    # skip differentials (none present here) - only globulin/total protein expected
                    msg = user_messages_map.get(m["marker"], None)
                    res_with_msgs.append({**m, "user_message": msg})
                selected_priority = {"priority": pname, "results": res_with_msgs, "message": "Top priority markers need attention."}
                break
        else:
            # For other priorities include all out-of-range markers found in this group
            res_with_msgs = []
            for m in group_out:
                # special handling for BUN and Creatinine messages depend on high/low
                msg_key = m["marker"]
                if m["marker"] == "BUN":
                    key = "BUN_low" if m["status"] == "low" else "BUN_high"
                    msg = user_messages_map.get(key)
                elif m["marker"] == "Creatinine":
                    key = "Creatinine_low" if m["status"] == "low" else "Creatinine_high"
                    msg = user_messages_map.get(key)
                else:
                    msg = user_messages_map.get(m["marker"])
                res_with_msgs.append({**m, "user_message": msg})
            selected_priority = {"priority": pname, "results": res_with_msgs, "message": f"{pname} markers need attention."}
            break

    # build list of all markers that were included in priority_focus and always_address to exclude from "other" list
    priority_markers_included = set()
    if selected_priority:
        for r in selected_priority.get("results", []):
            priority_markers_included.add(r.get("marker"))

    # Finally, populate "Other Markers Out of Range" by scanning all lab markers
    for panel_name, panel in lab_reports.items():
        for marker_key, data in panel.items():
            # we will evaluate by canonical marker_key (but evaluate_marker accepts any string)
            val = data.get("value")
            unit = data.get("unit")
            eval_res = await evaluate_marker(marker_key, val, unit)
            if eval_res.get("status") in ("low", "high"):
                if marker_key in always_markers or eval_res.get("marker") in priority_markers_included:
                    continue
                # avoid duplicates in other_out_of_range
                already = any(o.get("marker") == eval_res.get("marker") for o in other_out_of_range)
                if not already:
                    other_out_of_range.append({
                        "marker": eval_res.get("marker"),
                        "value": eval_res.get("value"),
                        "unit": eval_res.get("unit"),
                        "status": eval_res.get("status")
                    })

    # Compose final structured report consistent with spec
    report = {
        "user_id": user_data.get("user_id"),
        "always_address": always_address,
        "priority_focus": selected_priority,
        "other_out_of_range": other_out_of_range,
        "note": "We are prioritizing the most important markers first. By addressing these, other markers may come into range. Please recheck in 6–8 weeks.",
        "recheck_window": "Re-test in 6–8 weeks unless otherwise specified by your healthcare provider.",
        "safety_note": "If any of your results are far outside the healthy window, it may mean your body needs immediate support. Please contact your licensed healthcare provider promptly. If you feel unwell, seek urgent care."
    }

    return report