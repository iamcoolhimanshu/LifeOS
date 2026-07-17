package com.lifeos.api.service;

import com.lifeos.api.model.*;
import com.lifeos.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DatabaseSeedingService {

    @Value("${lifeos.upload.dir:./src/resouces/uploads}")
    private String uploadDir;

    @Autowired
    private NoteService noteService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private LearningRepository learningRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Transactional
    public void seedUserData(User user) {
        // 1. Seed Notes (which will also trigger Task extraction automatically!)
        if (noteRepository.findByUserAndArchivedFalseOrderByPinnedDescUpdatedAtDesc(user).isEmpty()) {
            noteService.createNote(
                user,
                "LifeOS Project Roadmap",
                "Phase 1: Configure JWT auth filters & user registration. (Completed)\nPhase 2: Build smart document uploads and neural parsing. (Completed)\nPhase 3: Implement clean theme compatibility across all components. (Completed)\nPhase 4: Setup real-time system sync integrations.\n\n- [ ] Complete JWT unit testing suites\n- [ ] Optimize database query indexes\n- [ ] Draft client API documentation integration",
                "Work",
                "roadmap,lifeos,active"
            );

            noteService.createNote(
                user,
                "Groq Llama AI Prompting Guide",
                "Tips for formatting system prompts for Groq Llama-3 models:\n- Be precise and brief\n- Use JSON structures where possible\n- Provide few-shot examples for better zero-shot classification.",
                "Learning",
                "ai,groq,llama"
            );

            noteService.createNote(
                user,
                "[Gmail] Weekly Standup Notes Alert",
                "Hi Team,\n\nHere are our action items for this week:\n- Refactor JWT auth filters\n- Validate database schema indexes\n- Finalize visual styling layout design.\n\nTodo: Fix styling issues in settings page components",
                "Work",
                "gmail,email-import"
            );

            noteService.createNote(
                user,
                "[Gmail] Subscription Renewal Invoice",
                "Hi Himanshu,\n\nYour subscription invoice for Amazon AWS compute instances has been processed.\nTotal charged: $154.00 USD.\n\nTodo: Track subscription in finance dashboard",
                "Finance",
                "gmail,invoice,aws"
            );
        }

        // 2. Seed Goals (KPIs)
        if (goalRepository.findByUserOrderByTargetDateAsc(user).isEmpty()) {
            goalService.createGoal(
                user,
                "AWS Developer Associate Certification",
                "Study security practices, DynamoDB, Lambda, and IAM configurations. Take 3 mock exams.",
                LocalDate.now().plusMonths(2),
                45,
                "IN_PROGRESS",
                "Career"
            );

            goalService.createGoal(
                user,
                "Train for 10K Run",
                "Run 3 times a week, focus on pacing and stamina. Stay hydrated.",
                LocalDate.now().plusMonths(1),
                75,
                "IN_PROGRESS",
                "Health"
            );

            goalService.createGoal(
                user,
                "Save emergency fund",
                "Save $5000 in high yield savings account.",
                LocalDate.now().plusMonths(6),
                100,
                "ACHIEVED",
                "Finance"
            );

            goalService.createGoal(
                user,
                "Master Spring Boot & React",
                "Build a complete Personal Digital Brain application with clean design systems.",
                LocalDate.now().plusWeeks(3),
                80,
                "IN_PROGRESS",
                "Learning"
            );
        }

        // 3. Seed Documents
        if (documentRepository.findByUserOrderByCreatedAtDesc(user).isEmpty()) {
            createMockDocument(user, "SQLGen_Report.pdf", "application/pdf", 
                "SQL generation report summarizing slow queries on user sessions. Indexes optimized on username and email fields.", 
                "Summary of SQL generation report detailing slow queries and database indexing optimizations.", 
                "Analytics", "database,sql,report");

            createMockDocument(user, "Software_Engineer_Resume.pdf", "application/pdf", 
                "Resume Summary for Java Developer. Skills: Java, Spring Boot, React. Experience: LifeOS development.", 
                "Professional resume listing experience in Java and Spring Boot backend services.", 
                "Career", "resume,cv,java");
        }

        // 4. Seed Transactions (Finance)
        if (transactionRepository.findByUserOrderByDateDesc(user).isEmpty()) {
            transactionRepository.save(new Transaction(user, "Monthly Salary credit", new BigDecimal("4200.00"), "INCOME", "Salary", LocalDate.now().minusDays(5)));
            transactionRepository.save(new Transaction(user, "AWS Cloud hosting server instance", new BigDecimal("154.00"), "EXPENSE", "Infrastructure", LocalDate.now().minusDays(2)));
            transactionRepository.save(new Transaction(user, "Office Workspace desk rental", new BigDecimal("300.00"), "EXPENSE", "Rent", LocalDate.now().minusDays(1)));
            transactionRepository.save(new Transaction(user, "Coffee and coworking meetup", new BigDecimal("18.50"), "EXPENSE", "Food", LocalDate.now()));
        }

        // 5. Seed Events (Calendar)
        if (eventRepository.findByUserOrderByStartTimeAsc(user).isEmpty()) {
            eventRepository.save(new Event(user, "AWS Developer Associate Exam Prep", "Go through Lambda, API Gateway and IAM mock test results.", LocalDateTime.now().plusHours(4), LocalDateTime.now().plusHours(6), false, "#a855f7", "Learning"));
            eventRepository.save(new Event(user, "Client Weekly Review Meeting", "Product walkthrough and milestone sync with the client team.", LocalDateTime.now().plusDays(1).plusHours(2), LocalDateTime.now().plusDays(1).plusHours(3), false, "#3b82f6", "Work"));
            eventRepository.save(new Event(user, "Evening Jog & Cardio Practice", "Run 5K around the local park.", LocalDateTime.now().plusHours(8), LocalDateTime.now().plusHours(9), false, "#10b981", "Health"));
        }

        // 6. Seed Learning Tracks
        if (learningRepository.findByUserOrderByCreatedAtDesc(user).isEmpty()) {
            learningRepository.save(new Learning(user, "Java Spring Boot Framework", "Learn JWT filters, Spring Security, JPA relationships, and transaction rules.", "LEARNING", 80, "Focused on transactional boundaries and lock managers. Completed security configuration filter chains."));
            learningRepository.save(new Learning(user, "AWS Cloud Architecture Practitioner", "Understand VPC networks, load balancing, EC2 scalability, and S3 encryption properties.", "LEARNING", 50, "Studying AWS Cognito integration and secure IAM Roles. Completed EC2 setup labs."));
            learningRepository.save(new Learning(user, "React & TypeScript Frontend Styling", "Configure Vite bundlers, Tailwind theme variables, responsive grids, and design guidelines.", "COMPLETED", 100, "Learned how custom layouts sync dark/light modes using localStorage. Built custom GlassCard component."));
        }

        // 7. Seed Job Applications (Career)
        if (jobApplicationRepository.findByUserOrderByAppliedDateDesc(user).isEmpty()) {
            jobApplicationRepository.save(new JobApplication(user, "Google", "Associate Software Engineer", "INTERVIEWING", "$120,000 - $140,000", "https://google.com/careers", "Coding round cleared. Technical architectural interview scheduled.", LocalDate.now().minusDays(10)));
            jobApplicationRepository.save(new JobApplication(user, "Stripe", "Backend Engineer - API Platforms", "APPLIED", "$150,000", "https://stripe.com/jobs", "Resume screening passed. Waiting on recruiter callback.", LocalDate.now().minusDays(5)));
            jobApplicationRepository.save(new JobApplication(user, "Vercel", "Frontend Developer - Design Systems", "OFFER", "$130,000", "https://vercel.com/careers", "Offer received! Reviewing terms and equity package details.", LocalDate.now().minusDays(3)));
        }
    }

    private void createMockDocument(User user, String originalFileName, String contentType, String extractedText, String aiSummary, String aiCategory, String aiTags) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = uploadPath.resolve(uniqueFileName);
            Files.writeString(targetLocation, extractedText);

            Document document = new Document();
            document.setUser(user);
            document.setFileName(originalFileName);
            document.setFileType(contentType);
            document.setFilePath(targetLocation.toString());
            document.setFileSize((long) extractedText.length());
            document.setExtractedText(extractedText);
            document.setAiSummary(aiSummary);
            document.setAiCategory(aiCategory);
            document.setAiTags(aiTags);

            documentRepository.save(document);
        } catch (IOException e) {
            System.err.println("Failed to seed mock document " + originalFileName + ": " + e.getMessage());
        }
    }
}
