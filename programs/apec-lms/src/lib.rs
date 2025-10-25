use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod apec_lms {
    use super::*;

    // Initialize the LMS system
    pub fn initialize_lms(
        ctx: Context<InitializeLms>,
        name: String,
        description: String,
    ) -> Result<()> {
        let lms_account = &mut ctx.accounts.lms_account;
        lms_account.authority = ctx.accounts.authority.key();
        lms_account.name = name;
        lms_account.description = description;
        lms_account.total_courses = 0;
        lms_account.total_students = 0;
        lms_account.total_instructors = 0;
        lms_account.bump = *ctx.bumps.get("lms_account").unwrap();
        
        emit!(LmsInitialized {
            authority: ctx.accounts.authority.key(),
            lms_account: lms_account.key(),
        });
        
        Ok(())
    }

    // Create a new course
    pub fn create_course(
        ctx: Context<CreateCourse>,
        course_id: String,
        title: String,
        description: String,
        price: u64,
        max_students: u32,
    ) -> Result<()> {
        let course = &mut ctx.accounts.course;
        course.course_id = course_id;
        course.title = title;
        course.description = description;
        course.instructor = ctx.accounts.instructor.key();
        course.price = price;
        course.max_students = max_students;
        course.current_students = 0;
        course.is_active = true;
        course.created_at = Clock::get()?.unix_timestamp;
        course.bump = *ctx.bumps.get("course").unwrap();

        // Update LMS stats
        let lms_account = &mut ctx.accounts.lms_account;
        lms_account.total_courses += 1;

        emit!(CourseCreated {
            course: course.key(),
            instructor: ctx.accounts.instructor.key(),
            course_id: course.course_id.clone(),
        });

        Ok(())
    }

    // Enroll student in a course
    pub fn enroll_student(
        ctx: Context<EnrollStudent>,
        enrollment_id: String,
    ) -> Result<()> {
        let enrollment = &mut ctx.accounts.enrollment;
        enrollment.enrollment_id = enrollment_id;
        enrollment.student = ctx.accounts.student.key();
        enrollment.course = ctx.accounts.course.key();
        enrollment.enrolled_at = Clock::get()?.unix_timestamp;
        enrollment.is_active = true;
        enrollment.progress = 0;
        enrollment.bump = *ctx.bumps.get("enrollment").unwrap();

        // Update course student count
        let course = &mut ctx.accounts.course;
        course.current_students += 1;

        // Update LMS stats
        let lms_account = &mut ctx.accounts.lms_account;
        lms_account.total_students += 1;

        emit!(StudentEnrolled {
            enrollment: enrollment.key(),
            student: ctx.accounts.student.key(),
            course: ctx.accounts.course.key(),
        });

        Ok(())
    }

    // Issue a certificate/credential
    pub fn issue_certificate(
        ctx: Context<IssueCertificate>,
        certificate_id: String,
        credential_type: CredentialType,
        metadata_uri: String,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        certificate.certificate_id = certificate_id;
        certificate.student = ctx.accounts.student.key();
        certificate.course = ctx.accounts.course.key();
        certificate.instructor = ctx.accounts.instructor.key();
        certificate.credential_type = credential_type;
        certificate.metadata_uri = metadata_uri;
        certificate.issued_at = Clock::get()?.unix_timestamp;
        certificate.is_verified = true;
        certificate.bump = *ctx.bumps.get("certificate").unwrap();

        emit!(CertificateIssued {
            certificate: certificate.key(),
            student: ctx.accounts.student.key(),
            course: ctx.accounts.course.key(),
            credential_type,
        });

        Ok(())
    }

    // Award tokens for achievements
    pub fn award_tokens(
        ctx: Context<AwardTokens>,
        amount: u64,
        achievement_type: AchievementType,
    ) -> Result<()> {
        let achievement = &mut ctx.accounts.achievement;
        achievement.student = ctx.accounts.student.key();
        achievement.achievement_type = achievement_type;
        achievement.amount = amount;
        achievement.awarded_at = Clock::get()?.unix_timestamp;
        achievement.bump = *ctx.bumps.get("achievement").unwrap();

        // Transfer tokens to student
        let cpi_accounts = Transfer {
            from: ctx.accounts.student_token_account.to_account_info(),
            to: ctx.accounts.student_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        emit!(TokensAwarded {
            student: ctx.accounts.student.key(),
            amount,
            achievement_type,
        });

        Ok(())
    }

    // Update course progress
    pub fn update_progress(
        ctx: Context<UpdateProgress>,
        progress_percentage: u8,
    ) -> Result<()> {
        require!(progress_percentage <= 100, ErrorCode::InvalidProgress);
        
        let enrollment = &mut ctx.accounts.enrollment;
        enrollment.progress = progress_percentage;

        emit!(ProgressUpdated {
            enrollment: enrollment.key(),
            student: ctx.accounts.student.key(),
            progress: progress_percentage,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, description: String)]
pub struct InitializeLms<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 256 + 4 + 256 + 8 + 8 + 8 + 1,
        seeds = [b"lms"],
        bump
    )]
    pub lms_account: Account<'info, LmsAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(course_id: String, title: String, description: String, price: u64, max_students: u32)]
pub struct CreateCourse<'info> {
    #[account(
        init,
        payer = instructor,
        space = 8 + 4 + 64 + 4 + 256 + 4 + 256 + 32 + 8 + 4 + 4 + 1 + 8 + 1,
        seeds = [b"course", course_id.as_bytes()],
        bump
    )]
    pub course: Account<'info, Course>,
    #[account(
        mut,
        seeds = [b"lms"],
        bump = lms_account.bump
    )]
    pub lms_account: Account<'info, LmsAccount>,
    #[account(mut)]
    pub instructor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(enrollment_id: String)]
pub struct EnrollStudent<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + 4 + 64 + 32 + 32 + 8 + 1 + 1 + 1,
        seeds = [b"enrollment", enrollment_id.as_bytes()],
        bump
    )]
    pub enrollment: Account<'info, Enrollment>,
    #[account(
        mut,
        seeds = [b"course", course.course_id.as_bytes()],
        bump = course.bump
    )]
    pub course: Account<'info, Course>,
    #[account(
        mut,
        seeds = [b"lms"],
        bump = lms_account.bump
    )]
    pub lms_account: Account<'info, LmsAccount>,
    #[account(mut)]
    pub student: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(certificate_id: String, credential_type: CredentialType, metadata_uri: String)]
pub struct IssueCertificate<'info> {
    #[account(
        init,
        payer = instructor,
        space = 8 + 4 + 64 + 32 + 32 + 32 + 1 + 4 + 256 + 8 + 1 + 1,
        seeds = [b"certificate", certificate_id.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, Certificate>,
    #[account(
        seeds = [b"course", course.course_id.as_bytes()],
        bump = course.bump
    )]
    pub course: Account<'info, Course>,
    pub student: SystemAccount<'info>,
    pub instructor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, achievement_type: AchievementType)]
pub struct AwardTokens<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 8 + 1,
        seeds = [b"achievement", student.key().as_ref(), &achievement_type.to_string().as_bytes()],
        bump
    )]
    pub achievement: Account<'info, Achievement>,
    #[account(mut)]
    pub student: SystemAccount<'info>,
    #[account(mut)]
    pub student_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(progress_percentage: u8)]
pub struct UpdateProgress<'info> {
    #[account(
        mut,
        seeds = [b"enrollment", enrollment.enrollment_id.as_bytes()],
        bump = enrollment.bump,
        constraint = enrollment.student == student.key()
    )]
    pub enrollment: Account<'info, Enrollment>,
    pub student: Signer<'info>,
}

#[account]
pub struct LmsAccount {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
    pub total_courses: u64,
    pub total_students: u64,
    pub total_instructors: u64,
    pub bump: u8,
}

#[account]
pub struct Course {
    pub course_id: String,
    pub title: String,
    pub description: String,
    pub instructor: Pubkey,
    pub price: u64,
    pub max_students: u32,
    pub current_students: u32,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Enrollment {
    pub enrollment_id: String,
    pub student: Pubkey,
    pub course: Pubkey,
    pub enrolled_at: i64,
    pub is_active: bool,
    pub progress: u8,
    pub bump: u8,
}

#[account]
pub struct Certificate {
    pub certificate_id: String,
    pub student: Pubkey,
    pub course: Pubkey,
    pub instructor: Pubkey,
    pub credential_type: CredentialType,
    pub metadata_uri: String,
    pub issued_at: i64,
    pub is_verified: bool,
    pub bump: u8,
}

#[account]
pub struct Achievement {
    pub student: Pubkey,
    pub achievement_type: AchievementType,
    pub amount: u64,
    pub awarded_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CredentialType {
    Certificate,
    Diploma,
    Badge,
    MicroCredential,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AchievementType {
    CourseCompletion,
    QuizMaster,
    Participation,
    Leadership,
    Innovation,
}

#[event]
pub struct LmsInitialized {
    pub authority: Pubkey,
    pub lms_account: Pubkey,
}

#[event]
pub struct CourseCreated {
    pub course: Pubkey,
    pub instructor: Pubkey,
    pub course_id: String,
}

#[event]
pub struct StudentEnrolled {
    pub enrollment: Pubkey,
    pub student: Pubkey,
    pub course: Pubkey,
}

#[event]
pub struct CertificateIssued {
    pub certificate: Pubkey,
    pub student: Pubkey,
    pub course: Pubkey,
    pub credential_type: CredentialType,
}

#[event]
pub struct TokensAwarded {
    pub student: Pubkey,
    pub amount: u64,
    pub achievement_type: AchievementType,
}

#[event]
pub struct ProgressUpdated {
    pub enrollment: Pubkey,
    pub student: Pubkey,
    pub progress: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid progress percentage")]
    InvalidProgress,
    #[msg("Course is full")]
    CourseFull,
    #[msg("Course is not active")]
    CourseInactive,
    #[msg("Unauthorized access")]
    Unauthorized,
}
