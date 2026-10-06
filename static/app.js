const input = document.getElementById("conversationInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const charCount = document.getElementById("charCount");

const loading = document.getElementById("loading");
const results = document.getElementById("results");


// ========================================
// CHARACTER COUNTER
// ========================================

input.addEventListener("input", () => {

    charCount.textContent =
        `${input.value.length} characters`;

});


// ========================================
// ANALYZE BUTTON
// ========================================

analyzeBtn.addEventListener(
    "click",
    analyzeConversation
);


async function analyzeConversation() {

    const conversation =
        input.value.trim();


    if (!conversation) {

        alert(
            "Please paste a conversation first."
        );

        return;
    }


    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML =
        "⏳ Analyzing...";


    loading.classList.remove("hidden");

    results.classList.add("hidden");


    try {

        const response =
            await fetch(
                "/api/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        conversation:
                            conversation
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Analysis failed."
            );

        }


        displayResults(data);


    } catch (error) {

        console.error(error);


        alert(
            "TrustLens could not complete the analysis.\n\n" +
            error.message
        );


    } finally {

        loading.classList.add("hidden");


        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML =
            "🔍 Analyze Conversation";

    }

}



// ========================================
// DISPLAY RESULTS
// ========================================

function displayResults(data) {

    results.classList.remove("hidden");


    // ====================================
    // RISK SCORE
    // ====================================

    const score =
        Number(data.risk_score ?? 0);


    document.getElementById(
        "riskScore"
    ).textContent = score;



    // ====================================
    // RISK GAUGE
    // ====================================

    const gauge =
        document.getElementById(
            "riskGauge"
        );


    if (gauge) {

        const safeScore =
            Math.max(
                0,
                Math.min(
                    score,
                    100
                )
            );


        const angle =
            safeScore * 3.6;


        const riskColor =
            getRiskColor(score);


        gauge.style.background = `
            conic-gradient(
                ${riskColor} 0deg,
                ${riskColor} ${angle}deg,
                #242a35 ${angle}deg,
                #242a35 360deg
            )
        `;

    }



    // ====================================
    // RISK LEVEL
    // ====================================

    const riskLevel =
        document.getElementById(
            "riskLevel"
        );


    const level =
        String(
            data.risk_level ||
            "UNKNOWN"
        ).toUpperCase();


    riskLevel.textContent =
        level;


    riskLevel.style.color =
        getRiskColor(score);


    riskLevel.style.border =
        `1px solid ${getRiskColor(score)}`;



    // ====================================
    // CLAIMED IDENTITY
    // ====================================

    document.getElementById(
        "claimedIdentity"
    ).textContent =
        data.claimed_identity ||
        "None identified";



    // ====================================
    // REQUESTED ACTION
    // ====================================

    document.getElementById(
        "requestedAction"
    ).textContent =
        data.requested_action ||
        "No specific action identified";



    // ====================================
    // SUMMARY
    // ====================================

    document.getElementById(
        "summary"
    ).textContent =
        data.summary ||
        "No summary available.";
        // ====================================
// AI EVIDENCE
// ====================================

renderEvidence(
    data.evidence || []
);
// ====================================
// ATTACK PATH
// ====================================

renderAttackPath(
    data.attack_path || []
);


    // ====================================
    // MANIPULATION
    // ====================================

    renderManipulation(
        data.manipulation_tactics ||
        []
    );


// ========================================
// AI EVIDENCE
// ========================================

function renderEvidence(evidence) {

    const container =
        document.getElementById("evidenceList");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!evidence || !evidence.length) {

        container.innerHTML =
            '<span class="empty-state">' +
            'No specific evidence identified.' +
            '</span>';

        return;
    }

    evidence.forEach(item => {

        const element =
            document.createElement("div");

        element.className = "evidence-item";

        const icon =
            document.createElement("span");

        icon.className = "evidence-icon";
        icon.textContent = "🔎";

        const text =
            document.createElement("span");

        text.className = "evidence-text";
        text.textContent = item;

        element.appendChild(icon);
        element.appendChild(text);

        container.appendChild(element);
    });
}
    // ====================================
    // RED FLAGS
    // ====================================

    renderRedFlags(
        data.red_flags ||
        []
    );



    // ====================================
    // ESCALATION TIMELINE
    // ====================================

    renderTimeline(
        data.escalation ||
        []
    );



    // ====================================
    // SCAM ESCALATION SCORE
    // ====================================

    calculateEscalationScore(
        data
    );



    // ====================================
    // RECOMMENDATION
    // ====================================

    document.getElementById(
        "recommendation"
    ).textContent =
        data.recommendation ||
        "Verify the sender independently before taking action.";



    // ====================================
    // VERIFICATION
    // ====================================

    renderVerificationSteps(
        data.verification_steps ||
        []
    );



    // ====================================
    // SCROLL
    // ====================================

    setTimeout(() => {

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}



// ========================================
// RISK COLOR
// ========================================

function getRiskColor(score) {

    if (score >= 80) {

        return "#ff5c70";

    }


    if (score >= 50) {

        return "#f5b942";

    }


    return "#32d583";

}



// ========================================
// MANIPULATION BADGES
// ========================================

function renderManipulation(tactics) {

    const container =
        document.getElementById(
            "manipulationList"
        );


    container.innerHTML = "";


    if (!tactics.length) {

        container.innerHTML =
            '<span class="empty-state">' +
            'No major manipulation tactics detected.' +
            '</span>';

        return;
    }


    const icons = {

        "urgency": "⚡",

        "authority pressure": "👤",

        "fear": "😨",

        "threat": "⚠️",

        "time pressure": "⏱️",

        "impersonation": "🎭",

        "financial pressure": "💳",

        "credential request": "🔑",

        "social engineering": "🎭",

        "isolation": "🚫",

        "pressure": "🔥"

    };


    tactics.forEach(tactic => {

        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "manipulation-badge";


        const normalized =
            String(tactic)
                .toLowerCase()
                .trim();


        let icon = "🚩";


        for (
            const key in icons
        ) {

            if (
                normalized.includes(key)
            ) {

                icon =
                    icons[key];

                break;

            }

        }


        const iconSpan =
            document.createElement(
                "span"
            );

        iconSpan.textContent =
            icon;


        const textSpan =
            document.createElement(
                "span"
            );

        textSpan.textContent =
            tactic;


        badge.appendChild(
            iconSpan
        );

        badge.appendChild(
            textSpan
        );


        container.appendChild(
            badge
        );

    });

}

// ========================================
// ATTACK PATH
// ========================================

function renderAttackPath(stages) {

    const container =
        document.getElementById("attackPath");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!stages || !stages.length) {

        container.innerHTML =
            '<span class="empty-state">' +
            'No likely attack path identified.' +
            '</span>';

        return;
    }

    stages.forEach((stage, index) => {

        const item =
            document.createElement("div");

        item.className = "attack-path-item";

        const number =
            document.createElement("div");

        number.className = "attack-path-number";
        number.textContent =
            stage.stage || index + 1;

        const content =
            document.createElement("div");

        content.className = "attack-path-content";

        const label =
            document.createElement("div");

        label.className = "attack-path-label";
        label.textContent =
            stage.label || "Next step";

        const description =
            document.createElement("div");

        description.className =
            "attack-path-description";

        description.textContent =
            stage.description || "";

        content.appendChild(label);
        content.appendChild(description);

        item.appendChild(number);
        item.appendChild(content);

        container.appendChild(item);
    });
}

// ========================================
// RED FLAGS
// ========================================

function renderRedFlags(flags) {

    const container =
        document.getElementById(
            "redFlags"
        );


    container.innerHTML = "";


    if (!flags.length) {

        container.innerHTML =
            '<span class="empty-state">' +
            'No significant red flags detected.' +
            '</span>';

        return;
    }


    flags.forEach(flag => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "flag";


        item.textContent =
            flag;


        container.appendChild(
            item
        );

    });

}



// ========================================
// ESCALATION TIMELINE
// ========================================

function renderTimeline(steps) {

    const container =
        document.getElementById(
            "timeline"
        );


    container.innerHTML = "";


    if (!steps.length) {

        container.innerHTML =
            '<div class="empty-state">' +
            'No escalation pattern detected.' +
            '</div>';

        return;
    }


    steps.forEach(
        (step, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "timeline-step";


            const title =
                step.label ||
                `Stage ${index + 1}`;


            const description =
                step.description ||
                "";


            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
                "timeline-dot";


            const heading =
                document.createElement(
                    "h4"
                );

            heading.textContent =
                title;


            const paragraph =
                document.createElement(
                    "p"
                );

            paragraph.textContent =
                description;


            element.appendChild(
                dot
            );

            element.appendChild(
                heading
            );

            element.appendChild(
                paragraph
            );


            container.appendChild(
                element
            );

        }
    );

}



// ========================================
// VERIFICATION STEPS
// ========================================

function renderVerificationSteps(
    steps
) {

    const container =
        document.getElementById(
            "verificationSteps"
        );


    container.innerHTML = "";


    if (!steps.length) {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            "Verify the sender through an official channel.";


        container.appendChild(
            li
        );


        return;
    }


    steps.forEach(step => {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            step;


        container.appendChild(
            li
        );

    });

}



// ========================================
// SCAM ESCALATION SCORE
// ========================================

function calculateEscalationScore(data) {

    const stages =
        data.escalation || [];


    let score = 0;


    /*
     * More escalation stages means
     * the conversation is progressing.
     */

    score +=
        stages.length * 18;


    /*
     * Overall scam risk also contributes.
     */

    const riskScore =
        Number(
            data.risk_score ?? 0
        );


    score +=
        riskScore * 0.25;


    /*
     * Requested sensitive actions
     * indicate deeper escalation.
     */

    const requestedAction =
        String(
            data.requested_action || ""
        ).toLowerCase();


    const dangerousTerms = [

        "otp",

        "password",

        "account number",

        "card",

        "payment",

        "money",

        "click the link",

        "credentials",

        "personal information"

    ];


    dangerousTerms.forEach(term => {

        if (
            requestedAction.includes(term)
        ) {

            score += 8;

        }

    });


    /*
     * Keep score between 0 and 100.
     */

    score =
        Math.round(
            Math.min(
                100,
                Math.max(
                    0,
                    score
                )
            )
        );


    /*
     * Display score.
     */

    const scoreElement =
        document.getElementById(
            "escalationScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            score;

        scoreElement.style.color =
            getRiskColor(score);

    }


    /*
     * Update progress bar.
     */

    const progressBar =
        document.getElementById(
            "escalationProgressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${score}%`;


        progressBar.style.background =
            getRiskColor(score);

    }

}



// ========================================
// DEMO SCENARIOS
// ========================================

function loadDemo(type) {

    const input =
        document.getElementById(
            "conversationInput"
        );


    const demos = {

        bank: `

Unknown Sender: Hello, I'm calling from your bank's security department.

You: Okay, what happened?

Unknown Sender: We detected suspicious activity on your account. Your account will be blocked today unless you verify it immediately.

You: How can I verify it?

Unknown Sender: Click the link I sent you and enter your account number, password and OTP. You have only 10 minutes.

You: Can I contact the bank directly?

Unknown Sender: No. You must complete the verification through this link immediately.

        `,


        job: `

Recruiter: Congratulations! Your profile has been selected for a work-from-home position with our company.

You: Thank you. What is the next step?

Recruiter: Your joining is confirmed today. You just need to pay ₹1,499 for the employee verification and registration process.

You: Can I verify the company first?

Recruiter: There is no time for that. Hundreds of candidates are waiting and your offer will be cancelled if you don't pay within 15 minutes.

You: Can you send me the official company email?

Recruiter: Just complete the payment through this link. Do not contact anyone else because this is an internal recruitment process.

        `,


        delivery: `

Delivery Agent: Your package could not be delivered because the address verification failed.

You: Which package is this?

Delivery Agent: It is your pending parcel. You need to pay ₹25 for address verification before delivery can be completed.

You: Can I verify the delivery through the official app?

Delivery Agent: There is no need. Use the payment link I sent you. The link will expire in 10 minutes.

You: Why do you need my card details?

Delivery Agent: Enter your card number and OTP to complete the verification. If you don't pay now, the package will be returned to the sender.

        `

    };


    if (!demos[type]) {

        return;

    }


    input.value =
        demos[type].trim();


    charCount.textContent =
        `${input.value.length} characters`;


    input.focus();


    input.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}