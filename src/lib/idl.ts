export const idl = {
  "version": "0.1.0",
  "name": "apec_lms",
  "instructions": [
    {
      "name": "initializeLms",
      "accounts": [
        {
          "name": "lmsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createCourse",
      "accounts": [
        {
          "name": "course",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lmsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "courseId",
          "type": "string"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "maxStudents",
          "type": "u32"
        }
      ]
    },
    {
      "name": "enrollStudent",
      "accounts": [
        {
          "name": "enrollment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "course",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lmsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "enrollmentId",
          "type": "string"
        }
      ]
    },
    {
      "name": "issueCertificate",
      "accounts": [
        {
          "name": "certificate",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "course",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "certificateId",
          "type": "string"
        },
        {
          "name": "credentialType",
          "type": "string"
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "awardTokens",
      "accounts": [
        {
          "name": "achievement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "studentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "achievementType",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateProgress",
      "accounts": [
        {
          "name": "enrollment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "progress",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "LmsAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "totalCourses",
            "type": "u32"
          },
          {
            "name": "totalStudents",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "Course",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "maxStudents",
            "type": "u32"
          },
          {
            "name": "currentStudents",
            "type": "u32"
          },
          {
            "name": "instructor",
            "type": "publicKey"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Enrollment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "course",
            "type": "publicKey"
          },
          {
            "name": "enrolledAt",
            "type": "i64"
          },
          {
            "name": "progress",
            "type": "u8"
          },
          {
            "name": "isCompleted",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Certificate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "course",
            "type": "publicKey"
          },
          {
            "name": "credentialType",
            "type": "string"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "issuedAt",
            "type": "i64"
          },
          {
            "name": "issuer",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Achievement",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "achievementType",
            "type": "string"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "awardedAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CourseNotFound",
      "msg": "Course not found"
    },
    {
      "code": 6001,
      "name": "EnrollmentNotFound",
      "msg": "Enrollment not found"
    },
    {
      "code": 6002,
      "name": "CourseFull",
      "msg": "Course is full"
    },
    {
      "code": 6003,
      "name": "AlreadyEnrolled",
      "msg": "Student already enrolled"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6005,
      "name": "InvalidProgress",
      "msg": "Invalid progress value"
    }
  ]
};
