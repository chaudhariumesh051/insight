const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// Path configurations
const NLP_SCRIPT_PATH = path.join(__dirname, '../scripts/process_experience_nlp.py');
const EXPERIENCES_FILE = path.join(__dirname, '../../public/processed_experiences.json');
const TEMP_DIR = path.join(__dirname, '../data');

// Ensure temp directory exists
async function ensureTempDirectory() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.log('Temp directory already exists or created');
  }
}

// Ensure the experiences file exists
async function ensureExperiencesFile() {
  try {
    await fs.access(EXPERIENCES_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty array
    const dir = path.dirname(EXPERIENCES_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(EXPERIENCES_FILE, JSON.stringify([], null, 2));
  }
}

// Load existing experiences
async function loadExperiences() {
  await ensureExperiencesFile();
  try {
    const data = await fs.readFile(EXPERIENCES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading experiences:', error);
    return [];
  }
}

// Save experiences to file
async function saveExperiences(experiences) {
  try {
    const dir = path.dirname(EXPERIENCES_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(EXPERIENCES_FILE, JSON.stringify(experiences, null, 2));
  } catch (error) {
    console.error('Error saving experiences:', error);
    throw error;
  }
}

// Process experience using NLP pipeline
async function processExperienceWithNLP(experienceData) {
  await ensureTempDirectory();
  
  return new Promise(async (resolve, reject) => {
    const timestamp = Date.now();
    const tempInputFile = path.join(TEMP_DIR, `temp_experience_${timestamp}.json`);
    const tempOutputFile = path.join(TEMP_DIR, `temp_processed_${timestamp}.json`);
    
    try {
      console.log('Starting NLP processing...');
      console.log('Input file:', tempInputFile);
      console.log('Output file:', tempOutputFile);
      console.log('NLP script path:', NLP_SCRIPT_PATH);
      
      // Write experience to temporary file
      await fs.writeFile(tempInputFile, JSON.stringify([experienceData], null, 2));
      console.log('Temporary input file created');
      
      // Check if Python script exists
      try {
        await fs.access(NLP_SCRIPT_PATH);
        console.log('NLP script found');
      } catch (error) {
        console.error('NLP script not found at:', NLP_SCRIPT_PATH);
        throw new Error('NLP script not found');
      }
      
      // Run NLP processing script
      console.log('Spawning Python process...');
      const pythonProcess = spawn('python', [NLP_SCRIPT_PATH, tempInputFile, tempOutputFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('Python stdout:', output);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        stderr += error;
        console.error('Python stderr:', error);
      });
      
      pythonProcess.on('close', async (code) => {
        console.log(`Python process exited with code: ${code}`);
        
        try {
          // Clean up temporary input file
          await fs.unlink(tempInputFile).catch(() => {}); // Ignore errors
          
          if (code !== 0) {
            console.error('NLP processing failed with code:', code);
            console.error('stderr:', stderr);
            console.error('stdout:', stdout);
            reject(new Error(`NLP processing failed with code ${code}: ${stderr}`));
            return;
          }
          
          // Check if output file was created
          try {
            await fs.access(tempOutputFile);
            console.log('Output file created successfully');
          } catch (error) {
            console.error('Output file not created');
            reject(new Error('Output file not created'));
            return;
          }
          
          // Read processed result
          const processedData = await fs.readFile(tempOutputFile, 'utf8');
          const processedExperiences = JSON.parse(processedData);
          
          // Clean up temporary output file
          await fs.unlink(tempOutputFile).catch(() => {}); // Ignore errors
          
          if (processedExperiences.length > 0) {
            console.log('NLP processing completed successfully');
            console.log('Processed experience keys:', Object.keys(processedExperiences[0]));
            resolve(processedExperiences[0]);
          } else {
            reject(new Error('No processed experience returned'));
          }
        } catch (error) {
          console.error('Error in processing results:', error);
          reject(error);
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Python process error:', error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
      
    } catch (error) {
      console.error('Error in NLP processing setup:', error);
      // Clean up files
      await fs.unlink(tempInputFile).catch(() => {});
      await fs.unlink(tempOutputFile).catch(() => {});
      reject(error);
    }
  });
}

// Create fallback processed experience
function createFallbackExperience(experienceData, error) {
  console.log('Creating fallback experience due to NLP failure:', error.message);
  
  // Basic sentiment analysis fallback
  const text = experienceData.experience || '';
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'selected', 'successful', 'smooth'];
  const negativeWords = ['bad', 'terrible', 'negative', 'rejected', 'failed', 'difficult', 'stressful'];
  
  let sentiment = 'neutral';
  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);
  
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Extract simple questions
  const questions = text.match(/[^.!?]*\?[^.!?]*/g) || [];
  
  return {
    ...experienceData,
    nlp_processed: false,
    nlp_error: error.message,
    sentiment_analysis: { 
      sentiment: sentiment, 
      confidence: 0.5,
      vader_scores: { compound: 0, pos: 0, neu: 1, neg: 0 },
      keyword_scores: { positive: positiveCount, negative: negativeCount, neutral: 0 }
    },
    categorized_questions: { 
      technical: [], 
      behavioral: [], 
      system_design: [], 
      coding: [], 
      other: questions 
    },
    extracted_insights: { 
      topics: [], 
      skills: [], 
      technologies: [], 
      difficulty_indicators: [], 
      preparation_tips: [], 
      red_flags: [], 
      positive_aspects: [] 
    },
    interview_rounds: [],
    highlights: ['Experience submitted successfully', 'NLP processing unavailable'],
    feedback_sentiment: sentiment,
    raw_questions: questions,
    roundwise_questions: { 'General Questions': questions },
    source: 'User Submission'
  };
}

// Get user experiences for BrowseExperience page
router.get('/user-experiences', async (req, res) => {
  try {
    const experiences = await loadExperiences();
    res.json(experiences);
  } catch (error) {
    console.error('Error loading user experiences:', error);
    res.status(500).json({ message: 'Failed to load experiences' });
  }
});

// Submit new experience
router.post('/submit-experience', async (req, res) => {
  try {
    const experienceData = req.body;
    
    // Validate required fields
    if (!experienceData.company || !experienceData.role) {
      return res.status(400).json({ 
        message: 'Company and role are required fields' 
      });
    }
    
    // Add submission metadata
    experienceData.submitted_at = new Date().toISOString();
    experienceData.id = experienceData.id || `exp_${Date.now()}`;
    
    console.log('Processing experience submission:', {
      id: experienceData.id,
      company: experienceData.company,
      role: experienceData.role,
      hasExperience: !!experienceData.experience
    });
    
    // Process with NLP pipeline
    let processedExperience;
    try {
      console.log('Attempting NLP processing...');
      processedExperience = await processExperienceWithNLP(experienceData);
      console.log('NLP processing successful');
    } catch (nlpError) {
      console.error('NLP processing failed:', nlpError.message);
      // Fallback: create basic processed experience without NLP
      processedExperience = createFallbackExperience(experienceData, nlpError);
    }
    
    // Load existing experiences
    const experiences = await loadExperiences();
    
    // Add new experience
    experiences.push(processedExperience);
    
    // Save updated experiences
    await saveExperiences(experiences);
    
    console.log('Experience saved successfully:', processedExperience.id);
    
    res.status(200).json({
      message: 'Experience submitted successfully',
      experience_id: processedExperience.id,
      nlp_processed: processedExperience.nlp_processed,
      sentiment: processedExperience.sentiment_analysis?.sentiment || 'neutral'
    });
    
  } catch (error) {
    console.error('Error submitting experience:', error);
    res.status(500).json({ 
      message: 'Failed to submit experience',
      error: error.message 
    });
  }
});

// Get all experiences
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await loadExperiences();
    res.json(experiences);
  } catch (error) {
    console.error('Error loading experiences:', error);
    res.status(500).json({ 
      message: 'Failed to load experiences',
      error: error.message 
    });
  }
});

// Get experience by ID
router.get('/experiences/:id', async (req, res) => {
  try {
    const experiences = await loadExperiences();
    const experience = experiences.find(exp => exp.id === req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (error) {
    console.error('Error loading experience:', error);
    res.status(500).json({ 
      message: 'Failed to load experience',
      error: error.message 
    });
  }
});

// Get experiences with filters
router.get('/experiences/filter', async (req, res) => {
  try {
    const { company, role, difficulty, sentiment } = req.query;
    let experiences = await loadExperiences();
    
    console.log('Filtering experiences with params:', { company, role, difficulty, sentiment });
    
    // Apply filters
    if (company && company !== 'all') {
      experiences = experiences.filter(exp => 
        exp.company && exp.company.toLowerCase().includes(company.toLowerCase())
      );
    }
    
    if (role && role !== 'all') {
      experiences = experiences.filter(exp => 
        exp.role && exp.role.toLowerCase().includes(role.toLowerCase())
      );
    }
    
    if (difficulty && difficulty !== 'all') {
      experiences = experiences.filter(exp => 
        exp.difficulty && exp.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    if (sentiment && sentiment !== 'all') {
      experiences = experiences.filter(exp => 
        exp.feedback_sentiment && exp.feedback_sentiment.toLowerCase() === sentiment.toLowerCase()
      );
    }
    
    console.log(`Filtered to ${experiences.length} experiences`);
    res.json(experiences);
  } catch (error) {
    console.error('Error filtering experiences:', error);
    res.status(500).json({ 
      message: 'Failed to filter experiences',
      error: error.message 
    });
  }
});

// Get experience statistics
router.get('/experiences/stats', async (req, res) => {
  try {
    const experiences = await loadExperiences();
    
    const stats = {
      total: experiences.length,
      nlp_processed: experiences.filter(exp => exp.nlp_processed).length,
      companies: [...new Set(experiences.map(exp => exp.company).filter(Boolean))],
      roles: [...new Set(experiences.map(exp => exp.role).filter(Boolean))],
      difficulties: [...new Set(experiences.map(exp => exp.difficulty).filter(Boolean))],
      sentiments: [...new Set(experiences.map(exp => exp.feedback_sentiment).filter(Boolean))],
      verdicts: [...new Set(experiences.map(exp => exp.verdict).filter(Boolean))],
      sentiment_distribution: experiences.reduce((acc, exp) => {
        const sentiment = exp.feedback_sentiment || 'neutral';
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {}),
      verdict_distribution: experiences.reduce((acc, exp) => {
        const verdict = exp.verdict || 'Unknown';
        acc[verdict] = (acc[verdict] || 0) + 1;
        return acc;
      }, {}),
      difficulty_distribution: experiences.reduce((acc, exp) => {
        const difficulty = exp.difficulty || 'Unknown';
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting experience stats:', error);
    res.status(500).json({ 
      message: 'Failed to get experience statistics',
      error: error.message 
    });
  }
});

// Search experiences
router.get('/experiences/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const experiences = await loadExperiences();
    const searchTerm = q.toLowerCase().trim();
    
    const filteredExperiences = experiences.filter(exp => {
      const searchableText = [
        exp.company,
        exp.role,
        exp.original_experience,
        exp.verdict,
        exp.difficulty,
        ...(exp.highlights || []),
        ...(exp.raw_questions || []),
        ...(exp.extracted_insights?.technologies || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
    
    res.json(filteredExperiences);
  } catch (error) {
    console.error('Error searching experiences:', error);
    res.status(500).json({ 
      message: 'Failed to search experiences',
      error: error.message 
    });
  }
});

// Test NLP processing endpoint
router.post('/test-nlp', async (req, res) => {
  try {
    const testExperience = {
      id: 'test_' + Date.now(),
      company: 'Test Company',
      role: 'Test Role',
      experience: 'This is a test experience for NLP processing. What is your experience with Python? How do you handle difficult situations?',
      verdict: 'Selected',
      difficulty: 'Medium'
    };
    
    console.log('Testing NLP processing...');
    const processed = await processExperienceWithNLP(testExperience);
    
    res.json({
      message: 'NLP processing test successful',
      processed: processed,
      nlp_tools_used: processed.nlp_tools_used
    });
  } catch (error) {
    console.error('NLP test failed:', error);
    res.status(500).json({
      message: 'NLP processing test failed',
      error: error.message,
      fallback_available: true
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const experiences = await loadExperiences();
    const stats = {
      total_experiences: experiences.length,
      nlp_processed: experiences.filter(exp => exp.nlp_processed).length,
      fallback_processed: experiences.filter(exp => !exp.nlp_processed).length
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const fs = require('fs').promises;
// const path = require('path');
// const { spawn } = require('child_process');

// // Path to the NLP processing script
// const NLP_SCRIPT_PATH = path.join(__dirname, '../scripts/process_experience_nlp.py');
// const EXPERIENCES_FILE = path.join(__dirname, '../../public/processed_experiences.json');

// // Ensure the experiences file exists
// async function ensureExperiencesFile() {
//   try {
//     await fs.access(EXPERIENCES_FILE);
//   } catch (error) {
//     // File doesn't exist, create it with empty array
//     await fs.writeFile(EXPERIENCES_FILE, JSON.stringify([], null, 2));
//   }
// }

// // Load existing experiences
// async function loadExperiences() {
//   await ensureExperiencesFile();
//   const data = await fs.readFile(EXPERIENCES_FILE, 'utf8');
//   return JSON.parse(data);
// }

// // Save experiences to file
// async function saveExperiences(experiences) {
//   await fs.writeFile(EXPERIENCES_FILE, JSON.stringify(experiences, null, 2));
// }

// // Process experience using NLP pipeline
// async function processExperienceWithNLP(experienceData) {
//   return new Promise((resolve, reject) => {
//     // Create temporary file for the experience
//     const tempInputFile = path.join(__dirname, '../data/temp_experience.json');
//     const tempOutputFile = path.join(__dirname, '../data/temp_processed.json');
    
//     // Write experience to temporary file
//     fs.writeFile(tempInputFile, JSON.stringify([experienceData], null, 2))
//       .then(() => {
//         // Run NLP processing script
//         const pythonProcess = spawn('python', [NLP_SCRIPT_PATH, tempInputFile, tempOutputFile]);
        
//         let stdout = '';
//         let stderr = '';
        
//         pythonProcess.stdout.on('data', (data) => {
//           stdout += data.toString();
//         });
        
//         pythonProcess.stderr.on('data', (data) => {
//           stderr += data.toString();
//         });
        
//         pythonProcess.on('close', async (code) => {
//           try {
//             // Clean up temporary input file
//             await fs.unlink(tempInputFile);
            
//             if (code !== 0) {
//               console.error('NLP processing failed:', stderr);
//               reject(new Error('NLP processing failed'));
//               return;
//             }
            
//             // Read processed result
//             const processedData = await fs.readFile(tempOutputFile, 'utf8');
//             const processedExperiences = JSON.parse(processedData);
            
//             // Clean up temporary output file
//             await fs.unlink(tempOutputFile);
            
//             if (processedExperiences.length > 0) {
//               console.log(processedExperiences)
//               resolve(processedExperiences[0]);
//             } else {
//               reject(new Error('No processed experience returned'));
//             }
//           } catch (error) {
//             reject(error);
//           }
//         });
//       })
//       .catch(reject);
//   });
// }

// //to display experiences in BrowseExperience page
// router.get('/user-experiences', async (req, res) => {
//   try {
//     const experiences = await loadExperiences();
//     res.json(experiences);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to load experiences' });
//   }
// });

// // Submit new experience
// router.post('/submit-experience', async (req, res) => {
//   try {
//     const experienceData = req.body;
    
//     // Validate required fields
//     if (!experienceData.company || !experienceData.role) {
//       return res.status(400).json({ 
//         message: 'Company and role are required fields' 
//       });
//     }
    
//     // Add submission timestamp
//     experienceData.submitted_at = new Date().toISOString();
//     experienceData.id = `exp_${Date.now()}`;
    
//     // Process with NLP pipeline
//     let processedExperience;
//     try {
//       processedExperience = await processExperienceWithNLP(experienceData);
//     } catch (nlpError) {
//       console.error('NLP processing failed:', nlpError);
//       // Fallback: create basic processed experience without NLP
//       processedExperience = {
//         ...experienceData,
//         nlp_processed: false,
//         sentiment_analysis: { sentiment: 'neutral', confidence: 0.5 },
//         categorized_questions: { technical: [], behavioral: [], system_design: [], coding: [], other: [] },
//         extracted_insights: { topics: [], skills: [], technologies: [], difficulty_indicators: [], preparation_tips: [], red_flags: [], positive_aspects: [] },
//         interview_rounds: [],
//         highlights: ['Experience submitted successfully'],
//         feedback_sentiment: 'neutral',
//         raw_questions: [],
//         roundwise_questions: {},
//         source: 'User Submission'
//       };
//     }
    
//     // Load existing experiences
//     const experiences = await loadExperiences();
    
//     // Add new experience
//     experiences.push(processedExperience);
    
//     // Save updated experiences
//     await saveExperiences(experiences);
    
//     res.status(200).json({
//       message: 'Experience submitted successfully',
//       experience_id: processedExperience.id,
//       nlp_processed: processedExperience.nlp_processed
//     });
    
//   } catch (error) {
//     console.error('Error submitting experience:', error);
//     res.status(500).json({ 
//       message: 'Failed to submit experience',
//       error: error.message 
//     });
//   }
// });

// // Get all experiences
// router.get('/experiences', async (req, res) => {
//   try {
//     const experiences = await loadExperiences();
//     res.json(experiences);
//   } catch (error) {
//     console.error('Error loading experiences:', error);
//     res.status(500).json({ 
//       message: 'Failed to load experiences',
//       error: error.message 
//     });
//   }
// });

// // Get experience by ID
// router.get('/experiences/:id', async (req, res) => {
//   try {
//     const experiences = await loadExperiences();
//     const experience = experiences.find(exp => exp.id === req.params.id);
    
//     if (!experience) {
//       return res.status(404).json({ message: 'Experience not found' });
//     }
    
//     res.json(experience);
//   } catch (error) {
//     console.error('Error loading experience:', error);
//     res.status(500).json({ 
//       message: 'Failed to load experience',
//       error: error.message 
//     });
//   }
// });

// // Get experiences with filters
// router.get('/experiences/filter', async (req, res) => {
//   try {
//     const { company, role, difficulty, sentiment } = req.query;
//     let experiences = await loadExperiences();
    
//     // Apply filters
//     if (company && company !== 'all') {
//       experiences = experiences.filter(exp => 
//         exp.company && exp.company.toLowerCase().includes(company.toLowerCase())
//       );
//     }
    
//     if (role && role !== 'all') {
//       experiences = experiences.filter(exp => 
//         exp.role && exp.role.toLowerCase().includes(role.toLowerCase())
//       );
//     }
    
//     if (difficulty && difficulty !== 'all') {
//       experiences = experiences.filter(exp => 
//         exp.difficulty && exp.difficulty.toLowerCase() === difficulty.toLowerCase()
//       );
//     }
    
//     if (sentiment && sentiment !== 'all') {
//       experiences = experiences.filter(exp => 
//         exp.feedback_sentiment && exp.feedback_sentiment.toLowerCase() === sentiment.toLowerCase()
//       );
//     }
    
//     res.json(experiences);
//   } catch (error) {
//     console.error('Error filtering experiences:', error);
//     res.status(500).json({ 
//       message: 'Failed to filter experiences',
//       error: error.message 
//     });
//   }
// });

// // Get experience statistics
// router.get('/experiences/stats', async (req, res) => {
//   try {
//     const experiences = await loadExperiences();
    
//     const stats = {
//       total: experiences.length,
//       companies: [...new Set(experiences.map(exp => exp.company).filter(Boolean))],
//       roles: [...new Set(experiences.map(exp => exp.role).filter(Boolean))],
//       difficulties: [...new Set(experiences.map(exp => exp.difficulty).filter(Boolean))],
//       sentiments: [...new Set(experiences.map(exp => exp.feedback_sentiment).filter(Boolean))],
//       verdicts: [...new Set(experiences.map(exp => exp.verdict).filter(Boolean))],
//       average_sentiment: experiences.reduce((acc, exp) => {
//         const sentiment = exp.feedback_sentiment || 'neutral';
//         if (sentiment === 'positive') acc.positive++;
//         else if (sentiment === 'negative') acc.negative++;
//         else acc.neutral++;
//         return acc;
//       }, { positive: 0, negative: 0, neutral: 0 })
//     };
    
//     res.json(stats);
//   } catch (error) {
//     console.error('Error getting experience stats:', error);
//     res.status(500).json({ 
//       message: 'Failed to get experience statistics',
//       error: error.message 
//     });
//   }
// });

// module.exports = router;
