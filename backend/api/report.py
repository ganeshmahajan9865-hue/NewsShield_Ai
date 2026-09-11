"""
NewsShield_AI - PDF Verification Report Generator
Builds a professional, branded verification report in PDF format using ReportLab.
Complies with PRD Section 24 & Section 32.
"""

import io
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from backend.db.storage import get_analysis_by_id

router = APIRouter(tags=["Reports"])


@router.get("/reports/{analysis_id}/pdf")
def generate_pdf_report(analysis_id: str):
    """
    Generates and downloads a structured NewsShield_AI Verification Report in PDF.
    """
    record = get_analysis_by_id(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found for report generation.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a")
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b")
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b")
    )

    # 1. Header Banner
    story.append(Paragraph("NEWSSHIELD_AI VERIFICATION REPORT", title_style))
    story.append(Paragraph(f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} | Report ID: {analysis_id}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3b82f6"), spaceAfter=15, spaceBefore=8))

    # 2. Executive Verdict Card
    is_real = record["prediction"] == "Likely Real"
    badge_bg = colors.HexColor("#dcfce7") if is_real else colors.HexColor("#fee2e2")
    badge_fg = colors.HexColor("#15803d") if is_real else colors.HexColor("#b91c1c")

    summary_data = [
        [
            Paragraph("<b>Classification Verdict:</b>", body_style),
            Paragraph(f"<font color='{badge_fg.hexval()}'><b>{record['prediction'].upper()}</b></font>", body_style)
        ],
        [
            Paragraph("<b>Calibrated Confidence:</b>", body_style),
            Paragraph(f"<b>{int(record['confidence'] * 100)}%</b>", body_style)
        ],
        [
            Paragraph("<b>Model Reference:</b>", body_style),
            Paragraph(f"{record.get('model_name', 'LinearSVM')} v{record.get('model_version', '1.0')}", body_style)
        ],
        [
            Paragraph("<b>Evidence Status:</b>", body_style),
            Paragraph(f"<b>{record.get('evidence_status') or 'Evaluated'}</b>", body_style)
        ]
    ]

    summary_table = Table(summary_data, colWidths=[160, 370])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # 3. Analyzed Statement / Content Excerpt
    story.append(Paragraph("Analyzed Text Excerpt", section_heading))
    excerpt = record.get("news_text", "")
    if len(excerpt) > 400:
        excerpt = excerpt[:400] + "..."
    story.append(Paragraph(f"<i>\"{excerpt}\"</i>", body_style))
    story.append(Spacer(1, 12))

    # 4. Retrieved External Evidence Items
    evidence_items = record.get("evidence_items", [])
    if evidence_items:
        story.append(Paragraph(f"Retrieved External Sources ({len(evidence_items)})", section_heading))
        
        ev_table_data = [[
            Paragraph("<b>Source / Publisher</b>", body_style),
            Paragraph("<b>Passage Snippet & Context</b>", body_style),
            Paragraph("<b>Assessment</b>", body_style)
        ]]

        for ev in evidence_items[:4]:
            pub = ev.get("source_name") or "Web Source"
            snip = ev.get("snippet", "")[:180] + "..."
            typ = ev.get("evidence_type") or "Context"
            ev_table_data.append([
                Paragraph(f"<b>{pub}</b>", body_style),
                Paragraph(snip, body_style),
                Paragraph(f"<b>{typ}</b>", body_style)
            ])

        ev_table = Table(ev_table_data, colWidths=[120, 310, 100])
        ev_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(ev_table)
        story.append(Spacer(1, 15))

    # 5. Responsible AI Disclaimer (PRD Appendix C)
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#cbd5e1"), spaceAfter=8, spaceBefore=8))
    story.append(Paragraph("<b>Responsible AI Disclaimer & Limitations:</b>", disclaimer_style))
    story.append(Paragraph(
        "NewsShield_AI provides AI-assisted credibility analysis based on learned patterns and retrieved external evidence. "
        "A 'Likely Real' or 'Likely Fake' assessment does not constitute a legal or absolute guarantee of factual truth. "
        "Users should review the cited sources, consult domain authorities, and exercise independent judgment.",
        disclaimer_style
    ))

    # Build Document
    doc.build(story)
    buffer.seek(0)

    filename = f"NewsShield_Report_{analysis_id[:8]}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
