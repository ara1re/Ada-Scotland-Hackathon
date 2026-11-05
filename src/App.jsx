import React, { useState } from 'react';
import './App.css';
import { mentors, careers, events, featuredStats } from './data/mockData';
import logoImage from './assets/company-logo.png';

const bookingMinDate = new Date().toISOString().split('T')[0];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedJourney, setSelectedJourney] = useState('All');
  
  // Interactive Modal & Registration States for Events
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [bookingMentor, setBookingMentor] = useState(null);
  const [detailMentor, setDetailMentor] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', time: '', message: '' });
  const [chatMentor, setChatMentor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [matchSubmitted, setMatchSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({ name: '', careerGoal: '', skills: '' });
  const [isLoading, setIsLoading] = useState(false);

  const industries = ['All', 'Technology', 'FinTech', 'Design'];
  const journeys = ['All', ...new Set(mentors.map((mentor) => mentor.journey))];
  const timeSlots = ['10:00 AM', '12:30 PM', '2:00 PM', '4:30 PM'];
  const filterByIndustry = (item) => selectedIndustry === 'All' || item.industry === selectedIndustry;
  const filterByJourney = (mentor) => selectedJourney === 'All' || mentor.journey === selectedJourney;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filterBySearch = (item) => {
    if (!normalizedSearch) return true;
    return [item.name, item.title, item.role, item.company, item.type, item.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  };
  const availableSkills = [...new Set([
    ...careers.flatMap((career) => career.requiredSkills),
    ...mentors.flatMap((mentor) => mentor.expertise),
  ])];

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const handleRegister = (eventId, e) => {
    e.stopPropagation(); // Prevent opening the modal when clicking the button directly
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents([...registeredEvents, eventId]);
      showNotice('You are registered. We sent the event details to your inbox.');
    }
  };

  const handleMatchSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      const goal = formData.careerGoal.toLowerCase();
      const skills = [
        ...selectedSkills,
        ...formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      ].map((skill) => skill.toLowerCase());
      const results = mentors
        .map((mentor) => {
          const searchable = `${mentor.role} ${mentor.company} ${mentor.expertise.join(' ')}`.toLowerCase();
          const score = skills.filter((skill) => searchable.includes(skill)).length
            + (goal && searchable.includes(goal) ? 2 : 0);
          return { mentor, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ mentor }) => mentor);

      setMatchedMentors(results);
      setMatchSubmitted(true);
      setIsLoading(false);
    }, 500);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((current) => current.includes(skill)
      ? current.filter((item) => item !== skill)
      : [...current, skill]);
  };

  const openBooking = (mentor) => {
    setChatMentor(null);
    setDetailMentor(null);
    setBookingMentor(mentor);
    setBookingSubmitted(false);
    setBookingData({ date: '', time: '', message: '' });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  const openChat = (mentor) => {
    setBookingMentor(null);
    setChatMentor(mentor);
    setChatMessages([
      {
        id: `welcome-${mentor.id}`,
        sender: mentor.name,
        text: `Hi! Thanks for reaching out through Nexus Network. What would you like to work on together?`,
      },
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = chatMessage.trim();
    if (!message || !chatMentor) return;

    setChatMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, sender: 'You', text: message },
      {
        id: `reply-${Date.now()}`,
        sender: chatMentor.name,
        text: `Thanks for sharing that. I’d be happy to discuss it in a session. You can use the request flow when you’re ready to book time.`,
      },
    ]);
    setChatMessage('');
  };

  return (
    <div className="mentor-app">
      {/* Navbar */}
      <header className="navbar">
        <button className="brand" onClick={() => setActiveTab('home')} aria-label="Go to home page">
          <img src={logoImage} alt="" />
        </button>
        <nav className="nav-links">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</button>
          <button className={activeTab === 'match' ? 'active' : ''} onClick={() => setActiveTab('match')}>Find Match</button>
          <button className={activeTab === 'mentors' ? 'active' : ''} onClick={() => setActiveTab('mentors')}>Mentor Directory</button>
          <button className={activeTab === 'careers' ? 'active' : ''} onClick={() => setActiveTab('careers')}>Career Explorer</button>
          <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events & Ops</button>
          <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About Us</button>
        </nav>
      </header>

      {/* Industry Filter Bar */}
      {['mentors', 'careers', 'events'].includes(activeTab) && (
        <div className="filter-bar">
          <span>Filter by Industry:</span>
          {industries.map((ind) => (
            <button 
              key={ind} 
              className={`filter-chip ${selectedIndustry === ind ? 'active-chip' : ''}`}
              onClick={() => setSelectedIndustry(ind)}
            >
              {ind}
            </button>
          ))}
          <label className="search-field">
            <span className="sr-only">Search this section</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              aria-label={`Search ${activeTab}`}
            />
          </label>
        </div>
      )}
      {activeTab === 'mentors' && (
        <div className="filter-bar journey-filter-bar">
          <span>Filter by Journey:</span>
          {journeys.map((journey) => (
            <button
              key={journey}
              className={`filter-chip ${selectedJourney === journey ? 'active-chip' : ''}`}
              onClick={() => setSelectedJourney(journey)}
            >
              {journey}
            </button>
          ))}
        </div>
      )}

      <main className="main-content">
        
        {/* HOMEPAGE */}
        {activeTab === 'home' && (
          <div className="hero-section">
            <img src={logoImage} alt="Nexus Network logo" className="homepage-logo" />
            <div className="hero-badge">Welcome to Nexus Network ✨</div>
            <h1>Your future in STEM starts here</h1>
            <p>
              Connect directly with industry leaders, explore curated career paths, 
              and scale your professional network across Tech, FinTech, Design, and more.
            </p>
            <section className="mission-panel" aria-label="Our mission">
              <h2>Built for women and non-binary professionals</h2>
              <p>
                Nexus Network helps women and non-binary people break into technology
                and discover opportunities across FinTech, design, product, data, and
                leadership.
              </p>
            </section>
            <div className="hero-actions">
              <button className="btn-primary hero-btn" onClick={() => setActiveTab('match')}>Find Your Match Now</button>
              <button className="btn-secondary hero-btn" onClick={() => setActiveTab('events')}>Browse Events</button>
            </div>
            <div className="stats-container">
              {featuredStats.map((stat, idx) => (
                <div key={idx} className="stat-box">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="single-logo-wrapper">
              <span className="single-logo-title">Powered by the Nexus Network community</span>
              <div className="single-logo-badge">
                <img src={logoImage} alt="Nexus Network logo" className="local-logo-img" />
                <span>Nexus Network</span>
              </div>
            </div>
          </div>
        )}

        {/* MENTOR MATCH FORM */}
        {activeTab === 'match' && (
          <div className="card">
            <img src={logoImage} alt="Nexus Network logo" className="section-logo" />
            <div className="card-header">
              <h1>Find Your Mentor</h1>
              <p>Connect with experienced industry leaders to accelerate your growth.</p>
            </div>
            <form onSubmit={handleMatchSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Alex Chen" required />
              </div>
              <div className="form-group">
                <label>Career Goal</label>
                <input type="text" value={formData.careerGoal} onChange={(e) => setFormData({...formData, careerGoal: e.target.value})} placeholder="e.g. Senior Frontend Engineer" required />
              </div>
              <div className="form-group">
                <label>Skills / Focus Areas</label>
                <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, TypeScript, System Design" required />
              </div>
              <div className="form-group">
                <label>Choose focus areas</label>
                <div className="quiz-skills-container">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      className={`quiz-pill ${selectedSkills.includes(skill) ? 'active-pill' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Searching...' : 'Find Mentors'}</button>
            </form>
            {matchSubmitted && (
              <div className="match-results" aria-live="polite">
                <div className="match-status-banner">
                  <span>{matchedMentors.length} mentor{matchedMentors.length === 1 ? '' : 's'} recommended for you</span>
                  <button className="clear-filter-btn" type="button" onClick={() => setMatchSubmitted(false)}>Start over</button>
                </div>
                <div className="match-list">
                  {matchedMentors.map((mentor) => (
                    <div className="match-result" key={mentor.id}>
                      <div>
                        <strong>{mentor.name}</strong>
                        <span>{mentor.role} at {mentor.company}</span>
                      </div>
                      <button className="btn-secondary" type="button" onClick={() => openBooking(mentor)}>Request Session</button>
                      <button className="btn-secondary" type="button" onClick={() => openChat(mentor)}>Open Secure Comms</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MENTOR DIRECTORY */}
        {activeTab === 'mentors' && (
          <div className="grid-section">
            <img src={logoImage} alt="Nexus Network logo" className="section-logo section-logo-left" />
            <h2>Available Mentors</h2>
            <div className="cards-grid">
              {mentors.filter(filterByIndustry).filter(filterByJourney).filter(filterBySearch).map(mentor => (
                <div key={mentor.id} className="grid-card">
                  <span className="badge">{mentor.industry}</span>
                  <h3>{mentor.name}</h3>
                  <p className="subtitle">{mentor.role} at <strong>{mentor.company}</strong></p>
                  <p className="mentor-detail"><strong>Education:</strong> {mentor.education}</p>
                  <p className="mentor-detail"><strong>Journey:</strong> {mentor.journey}</p>
                  <p className="mentor-detail"><strong>Interests:</strong> {mentor.interests}</p>
                  <p className="mentor-detail"><strong>Age:</strong> {mentor.age}</p>
                  <div className="tags">
                    {mentor.expertise.map(skill => <span key={skill} className="tag">{skill}</span>)}
                  </div>
                  <button className="mentor-profile-button" onClick={() => setDetailMentor(mentor)}>
                    View full mentor profile
                  </button>
                  <button className="mentor-email contact-button" onClick={() => openBooking(mentor)}>Contact {mentor.name}</button>
                  <button className="btn-secondary" onClick={() => openBooking(mentor)}>Request Session</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAREER EXPLORER */}
        {activeTab === 'careers' && (
          <div className="grid-section">
            <img src={logoImage} alt="Nexus Network logo" className="section-logo section-logo-left" />
            <h2>Career Paths Explorer</h2>
            <div className="cards-grid">
              {careers.filter(filterByIndustry).filter(filterBySearch).map(career => (
                <div key={career.id} className="grid-card">
                  <span className="badge">{career.industry}</span>
                  <h3>{career.title}</h3>
                  <p>Market Demand: <strong>{career.demand}</strong></p>
                  <p>Average Salary: <strong>{career.avgSalary}</strong></p>
                  <div className="tags">
                    {career.requiredSkills.map((skill) => <span key={skill} className="tag">{skill}</span>)}
                  </div>
                  <button className="btn-secondary" onClick={() => setSelectedCareer(career)}>
                    View Roadmap
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENTS & OPPORTUNITIES (INTERACTIVE SECTION) */}
        {activeTab === 'events' && (
          <div className="grid-section">
            <img src={logoImage} alt="Nexus Network logo" className="section-logo section-logo-left" />
            <h2>Upcoming Events & Opportunities</h2>
            <p className="section-hint">Click on any event card for details, or register instantly below.</p>
            <div className="cards-grid">
              {events.filter(filterByIndustry).filter(filterBySearch).map(event => {
                const isRegistered = registeredEvents.includes(event.id);
                return (
                  <div key={event.id} className="grid-card interactive-card" onClick={() => setSelectedEvent(event)}>
                    <div className="card-top-row">
                      <span className="badge">{event.industry}</span>
                      <span className="seats-tag">🔥 {event.seatsLeft} seats left</span>
                    </div>
                    <span className="event-type">{event.type}</span>
                    <h3>{event.title}</h3>
                    <p className="subtitle">📅 {event.date}</p>
                    
                    <button 
                      className={`btn-secondary ${isRegistered ? 'registered-btn' : ''}`}
                      onClick={(e) => handleRegister(event.id, e)}
                    >
                      {isRegistered ? 'Registered ✓' : 'Register Now'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid-section about-section">
            <div className="about-card">
              <img src={logoImage} alt="Nexus Network logo" className="about-logo-large" />
              <h2>Introducing The Nexus Network</h2>
              <p>
                As first-year graduate apprentices, we have experienced first-hand what
                it is like to enter the male-dominated technology industry.
              </p>
              <p>
                Reflecting on what we wish we had access to this time last year, we
                identified something missing: a supportive community of relatable role
                models who could offer advice, guidance and reassurance through their
                own real-life experiences, rather than simply relying on the abundance
                of information available online.
              </p>
              <p>
                We recognised the value of having someone who had already navigated the
                journey we were about to begin. Someone who could answer questions,
                share experiences and help make the unknown feel less intimidating.
                This is exactly what we needed, and what we want to provide for the next
                generation of women entering the industry.
              </p>
              <h3>Why Nexus?</h3>
              <p>
                A nexus is a connection, link or central point where different people,
                ideas and opportunities come together.
              </p>
              <p>
                Our digital platform aims to bridge the gap between young girls and
                women and the industries they aspire to be part of. By creating
                meaningful connections and increasing access to relatable role models,
                we want to eliminate the fear of the unknown, challenge outdated
                stereotypes and show that there is a place for everyone in technology.
              </p>
              <h3>Our Mentor Generator</h3>
              <p>
                At the heart of our platform is our Mentor Generator – a feature
                designed to connect users with women working in the technology industry
                based on their interests, aspirations and career goals. Rather than
                searching endlessly for inspiration, users can discover relatable
                mentors who have faced similar challenges, followed similar paths or
                work in roles they aspire to pursue.
              </p>
              <p>
                Through these connections, we hope to create more than just a digital
                platform. We want to build a community where women feel supported,
                represented, empowered and confident to take their next step.
              </p>
              <div className="about-mission">
                <h3>A network built for belonging</h3>
                <p>
                  We are creating a supportive network for women and non-binary people
                  who want to enter, grow, and lead across technology and the wider
                  professional landscape. Our community connects members with mentors,
                  peers, practical resources, and opportunities to build lasting careers.
                </p>
              </div>
              <button className="btn-primary" onClick={() => setActiveTab('match')}>
                Get Started
              </button>
            </div>
          </div>
        )}

      </main>

      {notice && <div className="toast-notice" role="status">{notice}</div>}

      {/* EVENT DETAILS POPUP MODAL */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="badge">{selectedEvent.industry}</span>
            <h2>{selectedEvent.title}</h2>
            <p className="modal-date">📅 {selectedEvent.date} ({selectedEvent.type})</p>
            <p className="modal-desc">{selectedEvent.description}</p>
            
            <div className="modal-actions">
              <a 
                href={selectedEvent.link} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary external-link-btn"
              >
                Open External Event Page ↗
              </a>
              <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedCareer && (
        <div className="modal-overlay" onClick={() => setSelectedCareer(null)}>
          <div className="modal-content roadmap-modal" onClick={(e) => e.stopPropagation()}>
            <span className="badge">{selectedCareer.industry}</span>
            <h2>{selectedCareer.title} roadmap</h2>
            <p className="modal-desc">
              A practical route from building your skills to finding your first
              opportunity in this career.
            </p>
            <ol className="roadmap-steps">
              {selectedCareer.roadmap.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <button className="btn-secondary" onClick={() => setSelectedCareer(null)}>
              Close roadmap
            </button>
          </div>
        </div>
      )}

      {detailMentor && (
        <div className="drawer-overlay" onClick={() => setDetailMentor(null)}>
          <aside className="mentor-drawer" onClick={(e) => e.stopPropagation()} aria-label={`${detailMentor.name} mentor profile`}>
            <div className="mentor-drawer-header">
              <div>
                <span className="badge">{detailMentor.industry}</span>
                <h2>{detailMentor.name}</h2>
                <p>{detailMentor.role} at {detailMentor.company}</p>
              </div>
              <button className="chat-close" type="button" onClick={() => setDetailMentor(null)} aria-label="Close mentor profile">×</button>
            </div>
            <div className="mentor-drawer-body">
              <div className="mentor-profile-meta">
                <span><strong>Journey</strong>{detailMentor.journey}</span>
                <span><strong>Education</strong>{detailMentor.education}</span>
                <span><strong>Interests</strong>{detailMentor.interests}</span>
              </div>
              <section>
                <h3>Background</h3>
                <p>{detailMentor.bio}</p>
              </section>
              <section className="mentor-advice">
                <h3>Advice for your next step</h3>
                <p>“{detailMentor.advice}”</p>
              </section>
              <div className="mentor-drawer-actions">
                <a className="btn-primary external-link-btn" href={detailMentor.profileUrl} target="_blank" rel="noreferrer">
                  View professional profile ↗
                </a>
                <button className="btn-secondary" onClick={() => openBooking(detailMentor)}>Request Session</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {bookingMentor && (
        <div className="modal-overlay" onClick={() => setBookingMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="badge">{bookingMentor.industry}</span>
            {bookingSubmitted ? (
              <>
                <h2>Session request sent to {bookingMentor.name}!</h2>
                <p className="modal-desc">
                  Your request for {bookingData.date} at {bookingData.time} is ready.
                  {bookingData.message && ' Your introductory note was included.'}
                </p>
                <button className="btn-primary" onClick={() => setBookingMentor(null)}>Done</button>
              </>
            ) : (
              <>
                <h2>Book a session with {bookingMentor.name}</h2>
                <p className="modal-desc">Choose a time and send a quick introduction.</p>
                <form className="booking-form" onSubmit={handleBookingSubmit}>
                  <div className="form-group">
                    <label htmlFor="booking-date">Preferred date</label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingData.date}
                      min={bookingMinDate}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-time">Preferred time</label>
                    <select
                      id="booking-time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="booking-message">Introduction or question</label>
                    <textarea
                      id="booking-message"
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      placeholder="What would you like to discuss?"
                      rows="4"
                    />
                  </div>
                  <button className="btn-primary" type="submit">Send Session Request</button>
                  <button className="btn-secondary" type="button" onClick={() => setBookingMentor(null)}>Cancel</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {chatMentor && (
        <aside className="chat-drawer" aria-label={`Secure Comms with ${chatMentor.name}`}>
          <div className="chat-header">
            <div>
              <span className="chat-kicker">SECURE COMMS</span>
              <h2>{chatMentor.name}</h2>
              <p>{chatMentor.role} at {chatMentor.company}</p>
            </div>
            <button className="chat-close" type="button" onClick={() => setChatMentor(null)} aria-label="Close chat">×</button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {chatMessages.map((message) => (
              <div className={`chat-message ${message.sender === 'You' ? 'chat-message-user' : ''}`} key={message.id}>
                <span>{message.sender}</span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSendMessage}>
            <label className="sr-only" htmlFor="chat-input">Message {chatMentor.name}</label>
            <input
              id="chat-input"
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <button className="btn-primary" type="submit">Send</button>
          </form>
        </aside>
      )}
    </div>
  );
}