/*
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com

Date:
Vikram Samvat: VS 2082
Gregorian: 2026-03-07

Purpose: Concepts route handler for the GanitSūtram API.
         Provides metadata about all supported mathematical operations.
*/

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../auth/auth-middleware');

const concepts = [
    {
        "id": "digital-root",
        "title": "Digital Root",
        "sutra": "Beejank",
        "desc": "Reduce any number to a single digit.",
        "inputs": 1,
        "operations": ["digital-root", "digital-root-steps"]
    },
    {
        "id": "squares-ending-5",
        "title": "Squares Ending in 5",
        "sutra": "Ekadhikena Purvena",
        "desc": "Instantly square any number ending in 5.",
        "inputs": 1,
        "operations": ["squares-ending-5", "squares-ending-5-steps"]
    },
    {
        "id": "multiply-by-11",
        "title": "Multiply by 11",
        "sutra": "Vedic 11x Pattern",
        "desc": "Multiply any number by 11 using digit bridging.",
        "inputs": 1,
        "operations": ["multiply-by-11", "multiply-by-11-steps"]
    },
    {
        "id": "nikhilam",
        "title": "Nikhilam",
        "sutra": "Nikhilam Navatashcaramam Dashatah",
        "desc": "Multiply numbers near a power-of-10 base.",
        "inputs": 2,
        "operations": ["nikhilam", "nikhilam-steps"]
    },
    {
        "id": "urdhva",
        "title": "Urdhva Tiryak",
        "sutra": "Urdhva Tiryagbhyam",
        "desc": "General multiplication vertically and crosswise.",
        "inputs": 2,
        "operations": ["urdhva", "urdhva-steps"]
    },
    {
        "id": "kaprekar",
        "title": "Kaprekar Routine",
        "sutra": "चक्रवाल",
        "desc": "Find the Kaprekar constant for any 3 or 4 digit number.",
        "inputs": 1,
        "inputType": "integer",
        "operations": ["kaprekar"]
    },
    {
        "id": "fibonacci",
        "title": "Fibonacci Sequence",
        "sutra": "आनुरूप्येण",
        "desc": "Generate Fibonacci sequence with digital root cycle analysis.",
        "inputs": 1,
        "inputType": "count",
        "operations": ["fibonacci"]
    },
    {
        "id": "square-pattern",
        "title": "Square Pattern",
        "sutra": "एकाधिकेन पूर्वेण",
        "desc": "Detect digital root patterns in perfect squares.",
        "inputs": 1,
        "inputType": "count",
        "operations": ["square-pattern"]
    },
    {
        "id": "analyse-sequence",
        "title": "Sequence Analyser",
        "sutra": "आनुरूप्येण",
        "desc": "Detect arithmetic, geometric, and Vedic patterns in any number sequence.",
        "inputs": 1,
        "inputType": "sequence",
        "operations": ["analyse-sequence"]
    }
];

/**
 * GET /api/concepts
 * Returns all supported mathematical operations and their metadata.
 */
router.get('/', optionalAuth, (req, res) => {
    res.json(concepts);
});

module.exports = router;
