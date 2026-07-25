package com.lifeos.api.service;

import com.lifeos.api.model.EmailDeliveryLog;
import com.lifeos.api.repository.EmailDeliveryLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class SystemEmailService {

    private static final Logger logger = LoggerFactory.getLogger(SystemEmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailDeliveryLogRepository deliveryLogRepository;

    @Autowired
    private com.lifeos.api.repository.UserConfigurationRepository userConfigurationRepository;

    @Autowired
    private OAuthTokenEncryptionService encryptionService;

    @Value("${lifeos.mail.from-address}")
    private String fromAddress;

    @Value("${lifeos.mail.from-name}")
    private String fromName;

    public void sendEmail(String to, String subject, String templateName, Map<String, String> variables) {
        sendEmail(null, to, subject, templateName, variables);
    }

    /**
     * Sends a rich LifeOS branded email.
     */
    public void sendEmail(com.lifeos.api.model.User user, String to, String subject, String templateName, Map<String, String> variables) {
        String body = getTemplateHtml(templateName, variables);
        
        try {
            JavaMailSender activeSender = this.mailSender;
            String activeFromAddress = this.fromAddress;
            String activeFromName = this.fromName;

            com.lifeos.api.model.UserConfiguration config = null;
            if (user != null) {
                config = userConfigurationRepository.findByUser(user).orElse(null);
            } else {
                java.util.List<com.lifeos.api.model.UserConfiguration> configs = userConfigurationRepository.findAll();
                if (!configs.isEmpty()) {
                    config = configs.get(0);
                }
            }

            if (config != null && config.getSmtpHost() != null && !config.getSmtpHost().trim().isEmpty()) {
                org.springframework.mail.javamail.JavaMailSenderImpl customSender = new org.springframework.mail.javamail.JavaMailSenderImpl();
                customSender.setHost(config.getSmtpHost());
                customSender.setPort(config.getSmtpPort() != null ? config.getSmtpPort() : 587);
                customSender.setUsername(config.getSmtpUsername());
                if (config.getEncryptedSmtpPassword() != null) {
                    customSender.setPassword(encryptionService.decrypt(config.getEncryptedSmtpPassword()));
                }
                
                java.util.Properties props = customSender.getJavaMailProperties();
                props.put("mail.transport.protocol", "smtp");
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.debug", "false");

                activeSender = customSender;
                activeFromAddress = config.getSmtpFromAddress() != null ? config.getSmtpFromAddress() : config.getSmtpUsername();
                activeFromName = config.getSmtpFromName() != null ? config.getSmtpFromName() : activeFromName;
                logger.info("Using dynamic UserConfiguration SMTP settings from Configuration Vault");
            }

            if (activeSender == null) {
                throw new IllegalStateException("SMTP JavaMailSender bean is not configured in Spring context.");
            }

            MimeMessage message = activeSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(activeFromAddress, activeFromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // Set to true to parse html

            activeSender.send(message);

            logger.info("Successfully sent email to {} with subject [{}] using template [{}]", to, subject, templateName);
            logDelivery(to, subject, templateName, "SENT", null);
        } catch (Exception e) {
            logger.error("Failed to send email to {} with subject [{}]: {}", to, subject, e.getMessage());
            logDelivery(to, subject, templateName, "FAILED", e.getMessage());
        }
    }

    private void logDelivery(String recipient, String subject, String templateName, String status, String error) {
        try {
            EmailDeliveryLog log = new EmailDeliveryLog(recipient, subject, templateName, status, error);
            deliveryLogRepository.save(log);
        } catch (Exception ex) {
            logger.error("Failed to save email delivery log in database: {}", ex.getMessage());
        }
    }

    /**
     * Professional glassmorphism-inspired HTML email templates
     */
    private String getTemplateHtml(String templateName, Map<String, String> vars) {
        String title = vars.getOrDefault("title", "LifeOS Notification");
        String username = vars.getOrDefault("username", "LifeOS User");
        String content = vars.getOrDefault("content", "");
        String link = vars.getOrDefault("link", "");
        String linkText = vars.getOrDefault("linkText", "Click Here");
        
        // Add footer variables
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String ipStr = vars.getOrDefault("ip", "N/A");
        String deviceStr = vars.getOrDefault("device", "N/A");

        // Action block html
        String actionButtonHtml = "";
        if (link != null && !link.isEmpty()) {
            actionButtonHtml = 
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <a href='" + link + "' style='background: linear-gradient(135deg, #a855f7, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);'>" + linkText + "</a>" +
                "</div>";
        }

        // Security recommendation alert block
        String securityDisclaimerHtml = "";
        if (templateName.toLowerCase().contains("security") || templateName.toLowerCase().contains("alert") || templateName.toLowerCase().contains("password") || templateName.toLowerCase().contains("device")) {
            securityDisclaimerHtml = 
                "<div style='background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 12px; margin-top: 25px; color: #f87171; font-size: 12px;'>" +
                "  <strong>Security Warning:</strong> If you did not trigger this request, please change your password immediately and contact secure-alerts@lifeos.com. We recommend enabling biometric settings on active devices." +
                "</div>";
        }

        // Standard outer envelope
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='utf-8'>" +
                "  <style>" +
                "    body { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 40px 15px; }" +
                "    .container { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 24px; border: 1px solid #1e293b; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }" +
                "    .logo { font-size: 20px; font-weight: 900; background: linear-gradient(135deg, #a855f7, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 20px; }" +
                "    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 15px; }" +
                "    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-top: 0; margin-bottom: 20px; }" +
                "    .meta { font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 30px; }" +
                "    .meta-item { margin-bottom: 6px; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='logo'>LifeOS</div>" +
                "    <h1>" + title + "</h1>" +
                "    <p>Hi " + username + ",</p>" +
                "    <p>" + content + "</p>" +
                "    " + actionButtonHtml + 
                "    " + securityDisclaimerHtml + 
                "    <div class='meta'>" +
                "      <div class='meta-item'><strong>Date / Time:</strong> " + dateStr + "</div>" +
                "      <div class='meta-item'><strong>IP Address:</strong> " + ipStr + "</div>" +
                "      <div class='meta-item'><strong>Device Session:</strong> " + deviceStr + "</div>" +
                "      <div style='margin-top: 15px; font-size: 10px; color: #475569;'>This is an automated security transmission from your LifeOS Personal Digital Brain.</div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
