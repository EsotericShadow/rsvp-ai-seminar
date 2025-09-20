import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'event' | 'breadcrumb'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Evergreen Web Solutions",
          url: "https://evergreenwebsolutions.ca",
          logo: "https://rsvp.evergreenwebsolutions.ca/logo.svg",
          description: "AI, Machine Learning, and automation solutions for businesses in Terrace and Northwest BC",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Terrace",
            addressRegion: "BC",
            addressCountry: "CA",
            postalCode: "V8G 1R1"
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-250-615-1234",
            contactType: "business inquiries",
            email: "gabriel.lacroix94@icloud.com"
          },
          founder: {
            "@type": "Person",
            name: "Gabriel Lacroix"
          },
          sameAs: [
            "https://evergreenwebsolutions.ca"
          ],
          areaServed: [
            {
              "@type": "City",
              name: "Terrace"
            },
            {
              "@type": "City", 
              name: "Kitimat"
            },
            {
              "@type": "City",
              name: "Prince Rupert"
            },
            {
              "@type": "City",
              name: "Smithers"
            }
          ],
          serviceType: [
            "AI Consulting",
            "Machine Learning",
            "AI Automation",
            "Custom AI Integrations",
            "RAG Systems",
            "AI Agents"
          ]
        }

      case 'event':
        return data || {
          "@context": "https://schema.org",
          "@type": "BusinessEvent",
          name: "AI in Northern BC: Information Session",
          startDate: "2025-10-23T18:00:00-07:00",
          endDate: "2025-10-23T20:30:00-07:00",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: "Sunshine Inn Terrace — Jasmine Room",
            address: {
              "@type": "PostalAddress",
              streetAddress: "4812 Hwy 16",
              addressLocality: "Terrace",
              addressRegion: "BC",
              addressCountry: "CA"
            }
          },
          organizer: {
            "@type": "Organization",
            name: "Evergreen Web Solutions",
            url: "https://evergreenwebsolutions.ca"
          },
          image: "https://rsvp.evergreenwebsolutions.ca/api/og?title=AI in Northern BC: Information Session&subtitle=Terrace, BC • October 23, 2025",
          description: "A comprehensive information session on AI, machine learning, and AI automation for Northern BC businesses. Learn about AI agents, custom AI integrations, RAG systems, and practical implementation strategies.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CAD",
            availability: "https://schema.org/InStock"
          },
          audience: {
            "@type": "Audience",
            audienceType: "Business owners, managers, and decision makers in Northern BC"
          }
        }

      case 'breadcrumb':
        return data || {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://rsvp.evergreenwebsolutions.ca"
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Event RSVP",
              item: "https://rsvp.evergreenwebsolutions.ca/rsvp"
            }
          ]
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
