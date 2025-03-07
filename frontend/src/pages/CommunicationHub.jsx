import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const CommunicationHub = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main App Sidebar */}
      <div className="w-20 fixed left-0 top-0 h-full">
        <Sidebar />
      </div>

      {/* Main Content Area - with left margin to clear the sidebar */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Top Bar */}
        <TopBar />

        {/* Custom Header - with adjusted positioning */}
        <div className="w-full px-[0.5rem] mt-[4rem] flex items-center pl-20">
          <h1 className="text-4xl font-bold text-gray-800 ml-24">
            Communication Hub
          </h1>
        </div>

        {/* Communication Hub Main Content */}
        <div className="flex-1 p-4 mt-4">
          <div className="flex h-full max-w-screen-2xl mx-auto gap-4">
            {/* Left Panel - Chats List */}
            <div className="w-72 bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">Chats</h2>
                <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search users & messages..."
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 flex items-center">
                  <span className="mr-1">📌</span> Pinned Chats...
                </p>
              </div>

              <div className="overflow-y-auto flex-1">
                {/* Pinned Chats */}
                <div className="px-2">
                  {[
                    { initials: "SJ", name: "Sarah Jones", message: "Thanks for your...", time: "3:30pm", unread: 3 },
                    { initials: "MB", name: "Mary Baker", message: "New lab results...", time: "4:45pm", unread: 26 }
                  ].map((chat, index) => (
                    <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {chat.initials}
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm truncate">{chat.name}</p>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                      </div>
                      {chat.unread && (
                        <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent Chats Header */}
                <div className="px-3 py-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500">Recent Chats...</p>
                </div>

                {/* Recent Chats */}
                <div className="px-2">
                  {[
                    { initials: "AG", name: "Arthur Gardner", message: "Can you check his...", time: "1:20pm", unread: 10 },
                    { initials: "TW", name: "Terence White", message: "", time: "1:05pm", unread: 0 },
                    { initials: "MJ", name: "Matt Johnson", message: "This is sent to your...", time: "8:45am", unread: 0 },
                    { initials: "JA", name: "Jerry Atman", message: "", time: "Yesterday", unread: 21 }
                  ].map((chat, index) => (
                    <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                        {chat.initials}
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm truncate">{chat.name}</p>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{chat.message || "No message"}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Panel - Chat Messages */}
            <div className="w-[calc(50%-190px)] bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                    SJ
                  </div>
                  <div className="ml-2">
                    <p className="font-medium">Sarah Jones</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border rounded-md px-2 py-1 text-sm mr-2"
                  />
                  <button className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date Header */}
              <div className="py-2 px-4 text-center">
                <span className="text-xs text-gray-500">15 Mar, 23</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Their Message */}
                <div className="flex">
                  <div className="max-w-xs lg:max-w-md rounded-lg bg-blue-100 p-3 text-sm">
                    <p>Hi Sarah, I wanted to confirm James Brown's upcoming visit for Thursday at 2pm.</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">1:10pm</div>

                {/* My Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md rounded-lg bg-green-100 p-3 text-sm">
                    <p>Yes! Just double-checking</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">1:12pm</div>

                {/* Date Header */}
                <div className="py-2 px-4 text-center">
                  <span className="text-xs text-gray-500">21 Mar, 23</span>
                </div>

                {/* Their Message */}
                <div className="flex">
                  <div className="max-w-xs lg:max-w-md rounded-lg bg-blue-100 p-3 text-sm">
                    <p>Thank you for rescheduling. Your appointment has been confirmed for Thursday at 4pm.</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">11:39am</div>

                {/* Their Message */}
                <div className="flex">
                  <div className="max-w-xs lg:max-w-md rounded-lg bg-blue-100 p-3 text-sm">
                    <p>Thank you for your care. We have a follow-up appointment scheduled for Friday, Mar 29 at 10am.</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">2:59pm</div>

                {/* My Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md rounded-lg bg-green-100 p-3 text-sm">
                    <p>OK</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">3:10pm</div>
              </div>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
                  />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600">
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Contact Details */}
            <div className="w-72 bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="p-3 border-b flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                  SJ
                </div>
                <div className="ml-2">
                  <p className="font-medium">Sarah Jones</p>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-amber-600 mb-2">Contact Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-16">Phone:</span>
                      <span className="text-sm">720-555-3012, ext. 4107 (M)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-16">Email:</span>
                      <span className="text-sm">sarah.jones@gmail.com</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-16">Preferred:</span>
                      <span className="text-sm">Email, Call, Portal</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-amber-600 mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                      <span>Call Patient</span>
                    </button>
                    <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                      <span>Send Message</span>
                    </button>
                    <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                      <span>Send Forms</span>
                    </button>
                    <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50">
                      <span>Send Payment Link</span>
                    </button>
                    <button className="flex items-center justify-center text-sm border rounded-md py-2 hover:bg-gray-50 col-span-2">
                      <span>Reschedule Appointment</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-amber-600 mb-2">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-24">Last Appt:</span>
                      <span className="text-sm">5/22/23</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-24">Next Appt:</span>
                      <span className="text-sm">6/5/23</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-24">Last Message:</span>
                      <span className="text-sm">5/23/23, "Ok"</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-24">Outstanding Balance:</span>
                      <span className="text-sm">$75</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 text-sm w-24">Last Treatment:</span>
                      <span className="text-sm">Deep Cleaning, 5/22/23</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
