import researchMinimalBlue from '../assets/templates/research-minimal-blue.png'
import researchInfographic from '../assets/templates/research-infographic.png'
import eventGradientPop from '../assets/templates/event-gradient-pop.png'
import eventCommunity from '../assets/templates/event-community.png'
import organizationalCorporate from '../assets/templates/organizational-corporate.png'
import researchEarthy from '../assets/templates/research-earthy.png'
import eventMinimalBlack from '../assets/templates/event-minimal-black.png'
import organizationalWarm from '../assets/templates/organizational-warm.png'
import eventFestival from '../assets/templates/event-festival.png'
import researchBold from '../assets/templates/research-bold.png'

export const templates = [
  {
    id: 'research-minimal-blue',
    name: 'Precision Research',
    posterTypes: ['RESEARCH/ACADEMIC POSTER'],
    topics: ['CONFERENCE', 'HACKATHON'],
    colorPalette: ['Blue', 'Purple', 'Blue-Purple'],
    styleTags: ['Minimal', 'Clean', 'Professional'],
    thumbnail: researchMinimalBlue,
    createdBy: 'Dr. Maya Chen',
    date: '01/15/2024',
    useCount: 1432,
    likes: 201,
    description: 'Crisp typographic hierarchy with ample white space, ideal for academic presentations.',
    layout: {
      background: '#eef2ff',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'PRECISION RESEARCH',
          position: { x: 60, y: 80 },
          styleName: 'title',
          style: {
            fontFamily: 'Inter',
            fontSize: 64,
            fontWeight: 800,
            fill: '#1e3a8a',
            textAlign: 'left'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Key Findings & Insights',
          position: { x: 60, y: 200 },
          style: {
            fontFamily: 'Inter',
            fontSize: 32,
            fontWeight: 600,
            fill: '#312e81',
            textAlign: 'left'
          }
        },
        {
          id: 'body',
          type: 'text',
          style: 'body',
          content: 'Use this space to summarize your abstract, methodology, and outcomes in a concise narrative.',
          position: { x: 60, y: 270 },
          style: {
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 400,
            fill: '#111827',
            backgroundColor: '#dbeafe',
            maxWidth: 640
          }
        },
        {
          id: 'metrics-heading',
          type: 'text',
          style: 'heading',
          content: 'Highlight Metrics',
          position: { x: 60, y: 420 },
          style: {
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 700,
            fill: '#1d4ed8'
          }
        },
        {
          id: 'metric-detail',
          type: 'text',
          style: 'body',
          content: '• 98% accuracy achieved\n• 12-month longitudinal study\n• 240 participants interviewed',
          position: { x: 60, y: 490 },
          style: {
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: 500,
            fill: '#1e293b',
            backgroundColor: '#e0f2fe',
            maxWidth: 620
          }
        },
        {
          id: 'chart-icon',
          type: 'element',
          elementType: 'chart',
          style: 'chart',
          icon: '📊',
          position: { x: 620, y: 760 }
        },
        {
          id: 'insight-icon',
          type: 'element',
          style: 'lightbulb',
          icon: '💡',
          position: { x: 700, y: 220 }
        }
      ]
    }
  },
  {
    id: 'research-infographic',
    name: 'Data Storyboard',
    posterTypes: ['RESEARCH/ACADEMIC POSTER', 'ORGANIZATIONAL'],
    topics: ['CONFERENCE'],
    colorPalette: ['Blue', 'Yellow', 'Yellow-Green'],
    styleTags: ['Infographic', 'Data-forward'],
    thumbnail: researchInfographic,
    createdBy: 'Analisa Flores',
    date: '02/11/2024',
    useCount: 1876,
    likes: 265,
    description: 'Modular layout with icon blocks and callouts for metrics-heavy posters.',
    layout: {
      background: '#e0f2fe',
      canvasSize: { width: 780, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'DATA STORYBOARD',
          position: { x: 70, y: 70 },
          style: {
            fontFamily: 'Inter',
            fontSize: 60,
            fontWeight: 800,
            fill: '#0f172a'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Tell your metrics-driven story clearly.',
          position: { x: 70, y: 150 },
          style: {
            fontFamily: 'Inter',
            fontSize: 30,
            fontWeight: 600,
            fill: '#1d4ed8'
          }
        },
        {
          id: 'left-panel',
          type: 'text',
          style: 'heading',
          content: 'Overview',
          position: { x: 70, y: 240 },
          style: {
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 700,
            fill: '#0f172a',
            backgroundColor: '#bae6fd',
            maxWidth: 300
          }
        },
        {
          id: 'left-body',
          type: 'text',
          style: 'body',
          content: 'Summarize the data themes, methodology, and headline insights here.',
          position: { x: 70, y: 310 },
          style: {
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: 500,
            fill: '#0f172a',
            backgroundColor: '#bae6fd',
            maxWidth: 300
          }
        },
        {
          id: 'top-metric',
          type: 'text',
          style: 'heading',
          content: 'Top Metric',
          position: { x: 420, y: 240 },
          style: {
            fontFamily: 'Inter',
            fontSize: 28,
            fontWeight: 700,
            fill: '#0f172a'
          }
        },
        {
          id: 'metric-callout',
          type: 'text',
          style: 'body',
          content: 'Highlight a key value or percentage.\nBack it with a short supporting statement.',
          position: { x: 420, y: 300 },
          style: {
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 600,
            fill: '#047857',
            backgroundColor: '#fef9c3',
            maxWidth: 280
          }
        },
        {
          id: 'chart-module',
          type: 'element',
          style: 'chart',
          icon: '📊',
          position: { x: 420, y: 460 }
        },
        {
          id: 'callout-emoji',
          type: 'element',
          style: 'lightbulb',
          icon: '💡',
          position: { x: 680, y: 820 }
        }
      ]
    }
  },
  {
    id: 'event-gradient-pop',
    name: 'Neon Night',
    posterTypes: ['SOCIAL EVENT POSTER'],
    topics: ['HACKATHON', 'FUNDRAISER'],
    colorPalette: ['Purple', 'Red', 'Red-Orange'],
    styleTags: ['Bold', 'Gradient', 'High contrast'],
    thumbnail: eventGradientPop,
    createdBy: 'Jordan Blake',
    date: '03/04/2024',
    useCount: 964,
    likes: 142,
    description: 'Vibrant gradient background with large headline for energetic night events.',
    layout: {
      background: '#2e1065',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'NEON NIGHT',
          position: { x: 80, y: 120 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 72,
            fontWeight: 800,
            fill: '#f472b6',
            backgroundColor: '#581c87'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Saturday • Doors at 8 PM',
          position: { x: 80, y: 230 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 38,
            fontWeight: 700,
            fill: '#f97316'
          }
        },
        {
          id: 'body',
          type: 'text',
          style: 'body',
                content: 'Join us for a high-energy night packed with music, lights, and unforgettable experiences. Secure your tickets now!',
                position: { x: 80, y: 310 },
                style: {
                  fontFamily: 'Montserrat',
            fontSize: 24,
            fontWeight: 500,
            fill: '#fef3c7',
            backgroundColor: '#701a75',
            maxWidth: 580
          }
        },
        {
          id: 'cta',
          type: 'text',
          style: 'heading',
                content: 'RSVP: neon.night/events',
                position: { x: 80, y: 460 },
                style: {
                  fontFamily: 'Montserrat',
            fontSize: 30,
            fontWeight: 700,
            fill: '#fde047',
            backgroundColor: '#581c87'
          }
        },
        {
          id: 'star-element',
          type: 'element',
          style: 'illustration',
          icon: '🌸',
          position: { x: 620, y: 180 }
        },
        {
          id: 'arrow-element',
          type: 'element',
          style: 'callout',
          icon: '💡',
          position: { x: 660, y: 400 }
        }
      ]
    }
  },
  {
    id: 'event-community',
    name: 'Community Spotlight',
    posterTypes: ['SOCIAL EVENT POSTER', 'ORGANIZATIONAL'],
    topics: ['VOLUNTEERING', 'FUNDRAISER'],
    colorPalette: ['Orange', 'Yellow', 'Red-Orange'],
    styleTags: ['Friendly', 'Illustrated'],
    thumbnail: eventCommunity,
    createdBy: 'Lena Ortiz',
    date: '02/22/2024',
    useCount: 1320,
    likes: 188,
    description: 'Warm palette with rounded shapes, perfect for community outreach.',
    layout: {
      background: '#fff7ed',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'COMMUNITY SPOTLIGHT',
          position: { x: 70, y: 70 },
          style: {
            fontFamily: 'Nunito',
            fontSize: 68,
            fontWeight: 800,
            fill: '#ea580c',
            backgroundColor: '#ffedd5'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Celebrate local heroes and volunteers.',
          position: { x: 70, y: 260 },
          style: {
            fontFamily: 'Nunito',
            fontSize: 34,
            fontWeight: 700,
            fill: '#b45309'
          }
        },
        {
          id: 'story-heading',
          type: 'text',
          style: 'heading',
          content: 'Stories',
          position: { x: 70, y: 370 },
          style: {
            fontFamily: 'Nunito',
            fontSize: 30,
            fontWeight: 700,
            fill: '#b45309',
            backgroundColor: '#fde68a'
          }
        },
        {
          id: 'story-body',
          type: 'text',
          style: 'body',
          content: 'Share highlights from recent community projects, volunteers, and upcoming needs.',
          position: { x: 70, y: 430 },
          style: {
            fontFamily: 'Nunito',
            fontSize: 22,
            fontWeight: 500,
            fill: '#7c2d12',
            backgroundColor: '#fde68a',
            maxWidth: 600
          }
        },
        {
          id: 'cta',
          type: 'text',
          style: 'heading',
          content: 'Get Involved →',
          position: { x: 70, y: 590 },
          style: {
            fontFamily: 'Nunito',
            fontSize: 28,
            fontWeight: 700,
            fill: '#ea580c',
            backgroundColor: '#fed7aa'
          }
        },
        {
          id: 'heart-element',
          type: 'element',
          style: 'illustration',
          icon: '🌸',
          position: { x: 660, y: 260 }
        },
        {
          id: 'star-element',
          type: 'element',
          style: 'lightbulb',
          icon: '💡',
          position: { x: 640, y: 520 }
        }
      ]
    }
  },
  {
    id: 'organizational-corporate',
    name: 'Executive Brief',
    posterTypes: ['ORGANIZATIONAL'],
    topics: ['CONFERENCE'],
    colorPalette: ['Blue', 'Blue-Purple'],
    styleTags: ['Corporate', 'Structured'],
    thumbnail: organizationalCorporate,
    createdBy: 'Claudia Ruiz',
    date: '01/28/2024',
    useCount: 2110,
    likes: 305,
    description: 'Grid-based layout with clean dividers for organizational announcements.',
    layout: {
      background: '#f1f5f9',
      canvasSize: { width: 740, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'EXECUTIVE BRIEF',
          position: { x: 80, y: 80 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 58,
            fontWeight: 800,
            fill: '#0f172a'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Quarterly updates & key initiatives',
          position: { x: 80, y: 150 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 30,
            fontWeight: 600,
            fill: '#1d4ed8'
          }
        },
        {
          id: 'summary-panel',
          type: 'text',
          style: 'body',
          content: 'Summarize headline wins, KPIs, and leadership messages in this section.',
          position: { x: 80, y: 230 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 22,
            fontWeight: 500,
            fill: '#0f172a',
            backgroundColor: '#dbeafe',
            maxWidth: 580
          }
        },
        {
          id: 'bullet-heading',
          type: 'text',
          style: 'heading',
          content: 'Highlights',
          position: { x: 80, y: 380 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 26,
            fontWeight: 700,
            fill: '#1e3a8a'
          }
        },
        {
          id: 'bullet-body',
          type: 'text',
          style: 'body',
          content: '• Milestone 1 achieved\n• Initiative 2 on track\n• New partnership announced',
          position: { x: 80, y: 430 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 20,
            fontWeight: 500,
            fill: '#0f172a',
            backgroundColor: '#e2e8f0',
            maxWidth: 560
          }
        },
        {
          id: 'contact-footer',
          type: 'text',
          style: 'body',
          content: 'Questions? Contact comms@company.com',
          position: { x: 80, y: 640 },
          style: {
            fontFamily: 'IBM Plex Sans',
            fontSize: 18,
            fontWeight: 600,
            fill: '#334155',
            backgroundColor: '#cbd5f5',
            maxWidth: 460
          }
        },
        {
          id: 'chart-element',
          type: 'element',
          style: 'chart',
          icon: '📊',
          position: { x: 600, y: 520 }
        }
      ]
    }
  },
  {
    id: 'research-earthy',
    name: 'Field Notes',
    posterTypes: ['RESEARCH/ACADEMIC POSTER'],
    topics: ['VOLUNTEERING', 'FUNDRAISER'],
    colorPalette: ['Yellow-Green', 'Blue', 'Blue-Purple'],
    styleTags: ['Organic', 'Handcrafted'],
    thumbnail: researchEarthy,
    createdBy: 'Noah Briggs',
    date: '04/12/2024',
    useCount: 768,
    likes: 119,
    description: 'Earthy palette and textured accents suited for environmental studies.',
    layout: {
      background: '#f7fee7',
      canvasSize: { width: 740, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'FIELD NOTES',
          position: { x: 60, y: 80 },
          style: {
            fontFamily: 'Caveat',
            fontSize: 62,
            fontWeight: 800,
            fill: '#166534'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Environmental impact study',
          position: { x: 60, y: 160 },
          style: {
            fontFamily: 'Caveat',
            fontSize: 30,
            fontWeight: 700,
            fill: '#1c4532'
          }
        },
        {
          id: 'body',
          type: 'text',
          style: 'body',
                content: 'Outline your methods, fieldwork summaries, and insights in this space.',
                position: { x: 60, y: 240 },
                style: {
                  fontFamily: 'Caveat',
            fontSize: 22,
            fontWeight: 500,
            fill: '#1f2937',
            backgroundColor: '#dcfce7',
            maxWidth: 580
          }
        },
        {
          id: 'quote',
          type: 'text',
          style: 'heading',
                content: '"Data gathered over three seasons highlights strong biodiversity recovery."',
                position: { x: 60, y: 380 },
                style: {
                  fontFamily: 'Caveat',
            fontSize: 24,
            fontWeight: 600,
            fill: '#166534',
            backgroundColor: '#bbf7d0',
            maxWidth: 560
          }
        },
        {
          id: 'photo-icon',
          type: 'element',
          style: 'photo',
          icon: '📷',
          position: { x: 600, y: 240 }
        },
        {
          id: 'chart-icon',
          type: 'element',
          style: 'chart',
          icon: '📊',
          position: { x: 620, y: 540 }
        }
      ]
    }
  },
  {
    id: 'event-minimal-black',
    name: 'Mono Modern',
    posterTypes: ['SOCIAL EVENT POSTER'],
    topics: ['HACKATHON', 'CONFERENCE'],
    colorPalette: ['Black', 'White', 'Blue'],
    styleTags: ['Minimal', 'High contrast'],
    thumbnail: eventMinimalBlack,
    createdBy: 'Sasha Ibarra',
    date: '05/08/2024',
    useCount: 842,
    likes: 133,
    description: 'Monochrome foundation with accent stripes for tech-forward gatherings.',
    layout: {
      background: '#0f172a',
      canvasSize: { width: 740, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'MONO MODERN',
          position: { x: 90, y: 120 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 70,
            fontWeight: 800,
            fill: '#f8fafc',
            backgroundColor: '#1e293b'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Tech Hackathon',
          position: { x: 90, y: 220 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 36,
            fontWeight: 700,
            fill: '#38bdf8'
          }
        },
        {
          id: 'body',
          type: 'text',
          style: 'body',
          content: 'Schedule Highlights:\n09:00 • Keynote kickoff\n12:00 • Lightning talks\n18:00 • Awards & networking',
          position: { x: 90, y: 300 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 24,
            fontWeight: 600,
            fill: '#e2e8f0',
            backgroundColor: '#1f2937',
            maxWidth: 520
          }
        },
        {
          id: 'cta',
          type: 'text',
          style: 'heading',
          content: 'Register now →',
          position: { x: 90, y: 520 },
          style: {
            fontFamily: 'Montserrat',
            fontSize: 28,
            fontWeight: 700,
            fill: '#38bdf8',
            backgroundColor: '#0f172a'
          }
        },
        {
          id: 'arrow-icon',
          type: 'element',
          style: 'callout',
          icon: '💡',
          position: { x: 620, y: 260 }
        },
        {
          id: 'star-icon',
          type: 'element',
          style: 'illustration',
          icon: '🌸',
          position: { x: 620, y: 540 }
        }
      ]
    }
  },
  {
    id: 'organizational-warm',
    name: 'Mission Update',
    posterTypes: ['ORGANIZATIONAL'],
    topics: ['VOLUNTEERING'],
    colorPalette: ['Orange', 'Yellow', 'Blue'],
    styleTags: ['Approachable', 'Story-driven'],
    thumbnail: organizationalWarm,
    createdBy: 'Priya Desai',
    date: '03/30/2024',
    useCount: 1543,
    likes: 192,
    description: 'Panel layout with space for testimonies and impact statements.',
    layout: {
      background: '#fffbeb',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'MISSION UPDATE',
          position: { x: 70, y: 80 },
          style: {
            fontFamily: 'Mukta',
            fontSize: 66,
            fontWeight: 800,
            fill: '#ea580c',
            backgroundColor: '#fed7aa'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Progress & impact from the field',
          position: { x: 70, y: 170 },
          style: {
            fontFamily: 'Mukta',
            fontSize: 32,
            fontWeight: 700,
            fill: '#b45309'
          }
        },
        {
          id: 'impact-heading',
          type: 'text',
          style: 'heading',
          content: 'Impact Snapshot',
          position: { x: 70, y: 260 },
          style: {
            fontFamily: 'Mukta',
            fontSize: 28,
            fontWeight: 700,
            fill: '#a16207',
            backgroundColor: '#fef08a'
          }
        },
        {
          id: 'impact-body',
          type: 'text',
          style: 'body',
          content: 'Summarize this quarter’s outcomes, partnerships, and upcoming priorities.',
          position: { x: 70, y: 320 },
          style: {
            fontFamily: 'Mukta',
            fontSize: 22,
            fontWeight: 500,
            fill: '#7c2d12',
            backgroundColor: '#fef3c7',
            maxWidth: 600
          }
        },
        {
          id: 'story-quote',
          type: 'text',
          style: 'heading',
          content: '"Volunteer voices remind us why we do this work."',
          position: { x: 70, y: 460 },
          style: {
            fontFamily: 'Mukta',
            fontSize: 24,
            fontWeight: 700,
            fill: '#ea580c',
            backgroundColor: '#fde68a',
            maxWidth: 580
          }
        },
        {
          id: 'heart-icon',
          type: 'element',
          style: 'illustration',
          icon: '🌸',
          position: { x: 650, y: 260 }
        },
        {
          id: 'lightbulb-icon',
          type: 'element',
          style: 'lightbulb',
          icon: '💡',
          position: { x: 640, y: 520 }
        }
      ]
    }
  },
  {
    id: 'event-festival',
    name: 'Festival Burst',
    posterTypes: ['SOCIAL EVENT POSTER'],
    topics: ['FUNDRAISER'],
    colorPalette: ['Red', 'Orange', 'Yellow'],
    styleTags: ['Playful', 'Illustrated'],
    thumbnail: eventFestival,
    createdBy: 'Elle Rivers',
    date: '06/01/2024',
    useCount: 1102,
    likes: 174,
    description: 'Illustration-forward layout that highlights performers or attractions.',
    layout: {
      background: '#fff1f2',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'FESTIVAL BURST',
          position: { x: 80, y: 100 },
          style: {
            fontFamily: 'Baloo 2',
            fontSize: 70,
            fontWeight: 800,
            fill: '#dc2626',
            backgroundColor: '#fee2e2'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Fundraiser & live performances',
          position: { x: 80, y: 200 },
          style: {
            fontFamily: 'Baloo 2',
            fontSize: 36,
            fontWeight: 700,
            fill: '#fb923c'
          }
        },
        {
          id: 'lineup-heading',
          type: 'text',
          style: 'heading',
          content: 'Line-up',
          position: { x: 80, y: 280 },
          style: {
            fontFamily: 'Baloo 2',
            fontSize: 30,
            fontWeight: 700,
            fill: '#c2410c',
            backgroundColor: '#ffedd5'
          }
        },
        {
          id: 'lineup-body',
          type: 'text',
          style: 'body',
          content: 'List headliners, activities, and special attractions here.',
          position: { x: 80, y: 340 },
          style: {
            fontFamily: 'Baloo 2',
            fontSize: 24,
            fontWeight: 600,
            fill: '#7c2d12',
            backgroundColor: '#fde68a',
            maxWidth: 620
          }
        },
        {
          id: 'ticket-cta',
          type: 'text',
          style: 'heading',
          content: 'Tickets available now →',
          position: { x: 80, y: 500 },
          style: {
            fontFamily: 'Baloo 2',
            fontSize: 28,
            fontWeight: 700,
            fill: '#ea580c',
            backgroundColor: '#fff7ed'
          }
        },
        {
          id: 'illustration-icon',
          type: 'element',
          style: 'illustration',
          icon: '🌸',
          position: { x: 660, y: 220 }
        },
        {
          id: 'arrow-icon',
          type: 'element',
          style: 'callout',
          icon: '💡',
          position: { x: 640, y: 520 }
        }
      ]
    }
  },
  {
    id: 'research-bold',
    name: 'Impact Abstract',
    posterTypes: ['RESEARCH/ACADEMIC POSTER', 'ORGANIZATIONAL'],
    topics: ['CONFERENCE', 'FUNDRAISER'],
    colorPalette: ['Blue', 'Red', 'Purple'],
    styleTags: ['Bold', 'Editorial'],
    thumbnail: researchBold,
    createdBy: 'Theo Marshall',
    date: '05/24/2024',
    useCount: 1987,
    likes: 284,
    description: 'Editorial-style layout with split columns and strong typography.',
    layout: {
      background: '#e8edff',
      canvasSize: { width: 760, height: 1080 },
      elements: [
        {
          id: 'title',
          type: 'text',
          style: 'title',
          content: 'IMPACT ABSTRACT',
          position: { x: 70, y: 80 },
          style: {
            fontFamily: 'Playfair Display',
            fontSize: 68,
            fontWeight: 800,
            fill: '#312e81'
          }
        },
        {
          id: 'subtitle',
          type: 'text',
          style: 'subtitle',
          content: 'Problem statement & outcomes',
          position: { x: 70, y: 170 },
          style: {
            fontFamily: 'Playfair Display',
            fontSize: 32,
            fontWeight: 700,
            fill: '#4338ca'
          }
        },
        {
          id: 'body',
          type: 'text',
          style: 'body',
          content: 'Outline the challenge, approach, and measurable impact in this space.',
          position: { x: 70, y: 250 },
          style: {
            fontFamily: 'Playfair Display',
            fontSize: 22,
            fontWeight: 500,
            fill: '#1f2937',
            backgroundColor: '#c7d2fe',
            maxWidth: 600
          }
        },
        {
          id: 'chart-heading',
          type: 'text',
          style: 'heading',
          content: 'Impact Visualization',
          position: { x: 70, y: 420 },
          style: {
            fontFamily: 'Playfair Display',
            fontSize: 30,
            fontWeight: 700,
            fill: '#1d4ed8'
          }
        },
        {
          id: 'chart-element',
          type: 'element',
          style: 'chart',
          icon: '📊',
          position: { x: 600, y: 440 }
        },
        {
          id: 'insight-element',
          type: 'element',
          style: 'lightbulb',
          icon: '💡',
          position: { x: 640, y: 720 }
        }
      ]
    }
  }
]

