const formStaticContent = {
  "Extraction Consent": `
Extraction(s) are to be performed on the tooth/teeth listed above. While we expect no complications, there are some risks involved with this procedure. The more common complications are:

- Pain, infection, swelling, bruising, and discoloration. Adjacent teeth may be chipped or damaged during the extraction.

- Nerves that run near the area of extraction may be bruised or damaged. You may experience some temporary numbness and tingling of the lip and chin, or in rare cases, the tongue. In some extremely rare instances, the lack of sensation could be permanent.

- In the upper arch, sinus complications can occur because the roots of some upper teeth extend near or into the sinuses. After extraction, a hole may be present between the sinus and the mouth. If this happens, you will be informed and the area repaired.

By signing below you acknowledge that you understand the information presented, have had all your questions answered satisfactorily, and give consent to perform this procedure.
  `,

  "Excuse Letter": `
Please excuse [nameFL] due to a dental appointment on [dateToday].
You are welcome to contact us with any questions.

Sincerely,
[providerFL]
  `,

  "HIPAA": `
I have had full opportunity to read and consider the contents of the Notice of Privacy Practices.
I understand that I am giving my permission to your use and disclosure of my protected health information
in order to carry out treatment, payment activities, and healthcare operations.
I also understand that I have the right to revoke permission.
  `,
    "Registration HIPAA Form2": [
    {
      id: "hipaaConsentBlock",
      text: `Private Practices: I (the patient) have the right to read the Privacy Practices...
...if you do agree then you are bound to abide by such restrictions.`,
    },
    {
      id: "accessListNote",
      text: `Please list any other parties who can have access to your health information. Indicate the person's name and relationship to the patient...`,
    },
  ],
};

export default formStaticContent;
