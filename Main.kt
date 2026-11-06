/**
 * ============================================================================
 * Project: Library Management System
 * File: Main.kt
 * 
 * Description:
 * Kotlin console-based implementation of the Library Management System logic.
 * Demonstrates:
 *   - Object-Oriented Domain Modeling with Kotlin data classes
 *   - Kotlin Collections (MutableMap, MutableList, filtering, reducing)
 *   - Control flow with Kotlin's idiomatic `when` expression
 *   - Transaction validation, duplicate prevention, and inventory consistency
 *
 * Compilation & Execution:
 *   kotlinc Main.kt -include-runtime -d LibrarySystem.jar
 *   java -jar LibrarySystem.jar
 * ============================================================================
 */

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Scanner

// ============================================================================
// DOMAIN MODELS & ENUMS
// ============================================================================

/**
 * Status enumeration for library book lending transactions.
 */
enum class IssueStatus {
    ISSUED,
    RETURNED
}

/**
 * Represents a catalogued book in the library.
 *
 * @property id Unique alphanumeric identifier (e.g. "BK-101").
 * @property title Title of the publication.
 * @property author Author of the book.
 * @property year Four-digit publication year.
 * @property totalCopies Total physical copies owned by the library.
 * @property availableCopies Copies currently on shelves ready for checkout.
 */
data class Book(
    val id: String,
    var title: String,
    var author: String,
    var year: Int,
    var totalCopies: Int,
    var availableCopies: Int
) {
    /**
     * Computes the circulation availability badge.
     */
    val statusDescription: String
        get() = when {
            availableCopies == 0 -> "OUT OF STOCK"
            availableCopies <= 2 && totalCopies > 2 -> "LOW STOCK"
            else -> "AVAILABLE"
        }
}

/**
 * Represents an issue/return circulation transaction record.
 *
 * @property transactionId Unique transaction code (e.g. "TXN-1001").
 * @property bookId Identifier of the borrowed book.
 * @property bookTitle Cached title of the book at the time of lending.
 * @property studentId Unique identifier of the student borrowing the book.
 * @property issueDate Timestamp when the checkout occurred.
 * @property returnDate Timestamp when the return occurred, or null if active.
 * @property status Current transaction state (ISSUED or RETURNED).
 */
data class IssueRecord(
    val transactionId: String,
    val bookId: String,
    val bookTitle: String,
    val studentId: String,
    val issueDate: String,
    var returnDate: String? = null,
    var status: IssueStatus = IssueStatus.ISSUED
)

// ============================================================================
// CORE BUSINESS LOGIC CONTROLLER
// ============================================================================

/**
 * Manages in-memory library collections and encapsulates business rules.
 */
class LibraryManager {
    // Appropriate Kotlin Collections:
    // 1. MutableMap for O(1) primary key lookup by Book ID (case-insensitive keys).
    private val booksMap: MutableMap<String, Book> = mutableMapOf()

    // 2. MutableList to preserve ordered circulation history.
    private val transactionsList: MutableList<IssueRecord> = mutableListOf()

    private var transactionCounter = 1000
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    init {
        loadSampleData()
    }

    /**
     * Seeds initial sample catalog and active borrowing records.
     */
    fun loadSampleData() {
        booksMap.clear()
        transactionsList.clear()

        val sampleBooks = listOf(
            Book("BK-101", "Clean Code: Agile Software Craftsmanship", "Robert C. Martin", 2008, 5, 4),
            Book("BK-102", "The Pragmatic Programmer: Your Journey", "David Thomas & Andrew Hunt", 2019, 4, 4),
            Book("BK-103", "Introduction to Algorithms (4th Ed)", "Thomas H. Cormen et al.", 2022, 3, 2),
            Book("BK-104", "Design Patterns: Reusable OO Software", "Erich Gamma et al.", 1994, 2, 1),
            Book("BK-105", "Kotlin in Action", "Dmitry Jemerov & Svetlana Isakova", 2017, 4, 4)
        )

        for (book in sampleBooks) {
            booksMap[book.id.uppercase()] = book
        }

        // Active sample loan records
        val now = LocalDateTime.now()
        transactionsList.add(
            IssueRecord(
                generateTxnId(),
                "BK-101",
                "Clean Code: Agile Software Craftsmanship",
                "STU-2024-001",
                now.minusDays(3).format(dateFormatter),
                null,
                IssueStatus.ISSUED
            )
        )
        transactionsList.add(
            IssueRecord(
                generateTxnId(),
                "BK-103",
                "Introduction to Algorithms (4th Ed)",
                "STU-2024-042",
                now.minusDays(2).format(dateFormatter),
                null,
                IssueStatus.ISSUED
            )
        )
        transactionsList.add(
            IssueRecord(
                generateTxnId(),
                "BK-104",
                "Design Patterns: Reusable OO Software",
                "STU-2024-089",
                now.minusDays(1).format(dateFormatter),
                null,
                IssueStatus.ISSUED
            )
        )
    }

    private fun generateTxnId(): String {
        transactionCounter++
        return "TXN-$transactionCounter"
    }

    private fun getTimestamp(): String {
        return LocalDateTime.now().format(dateFormatter)
    }

    // ========================================================================
    // TASK 1: Add New Books
    // ========================================================================
    fun addBook(
        id: String,
        title: String,
        author: String,
        year: Int,
        copies: Int
    ): Pair<Boolean, String> {
        val trimmedId = id.trim().uppercase()
        val trimmedTitle = title.trim()
        val trimmedAuthor = author.trim()

        // Validation: Empty inputs
        if (trimmedId.isEmpty() || trimmedTitle.isEmpty() || trimmedAuthor.isEmpty()) {
            return Pair(false, "Validation Failed: Book ID, Title, and Author cannot be blank.")
        }

        // Validation: Publication Year
        val currentYear = LocalDateTime.now().year
        if (year < 1000 || year > currentYear + 1) {
            return Pair(false, "Validation Failed: Publication year must be between 1000 and ${currentYear + 1}.")
        }

        // Validation: Available Copies
        if (copies <= 0) {
            return Pair(false, "Validation Failed: Number of copies must be at least 1.")
        }

        // Validation: Prevent duplicate Book IDs
        if (booksMap.containsKey(trimmedId)) {
            val existing = booksMap[trimmedId]!!
            return Pair(false, "Conflict: Book ID '$trimmedId' already exists ('${existing.title}'). Duplicates are not allowed.")
        }

        // Register new book
        val newBook = Book(
            id = trimmedId,
            title = trimmedTitle,
            author = trimmedAuthor,
            year = year,
            totalCopies = copies,
            availableCopies = copies
        )
        booksMap[trimmedId] = newBook

        return Pair(true, "Book '$trimmedTitle' (ID: $trimmedId) added successfully with $copies available copies.")
    }

    // ========================================================================
    // TASK 2: Display All Books
    // ========================================================================
    fun getAllBooks(): List<Book> {
        return booksMap.values.toList().sortedBy { it.id }
    }

    // ========================================================================
    // TASK 3: Search Books (by Book ID or Book Title)
    // ========================================================================
    fun searchBooks(query: String): List<Book> {
        val cleanQuery = query.trim().lowercase()
        if (cleanQuery.isEmpty()) return emptyList()

        return booksMap.values.filter { book ->
            book.id.lowercase().contains(cleanQuery) ||
            book.title.lowercase().contains(cleanQuery)
        }.sortedBy { it.id }
    }

    /**
     * Retrieves active students currently borrowing copies of a book.
     */
    fun getActiveBorrowers(bookId: String): List<IssueRecord> {
        val cleanId = bookId.trim().uppercase()
        return transactionsList.filter { it.bookId.uppercase() == cleanId && it.status == IssueStatus.ISSUED }
    }

    // ========================================================================
    // TASK 4: Issue Books
    // ========================================================================
    fun issueBook(bookId: String, studentId: String): Pair<Boolean, String> {
        val cleanBookId = bookId.trim().uppercase()
        val cleanStudentId = studentId.trim().uppercase()

        if (cleanBookId.isEmpty() || cleanStudentId.isEmpty()) {
            return Pair(false, "Error: Both Book ID and Student ID are required.")
        }

        // Step 1: Verify that the book exists
        val book = booksMap[cleanBookId]
            ?: return Pair(false, "Issuance Failed: Book ID '$cleanBookId' was not found in the catalog.")

        // Step 2: Ensure at least one copy is available
        if (book.availableCopies <= 0) {
            return Pair(false, "Issuance Failed: Book '${book.title}' is currently OUT OF STOCK (0 copies available).")
        }

        // Step 3: Prevent duplicate loans of the same book to the same student
        val alreadyIssued = transactionsList.any {
            it.bookId.uppercase() == cleanBookId &&
            it.studentId.uppercase() == cleanStudentId &&
            it.status == IssueStatus.ISSUED
        }
        if (alreadyIssued) {
            return Pair(false, "Issuance Blocked: Student '$cleanStudentId' already holds an active copy of '${book.title}'.")
        }

        // Step 4: Decrease available copies by one
        book.availableCopies -= 1

        // Step 5: Record the transaction
        val txnId = generateTxnId()
        val record = IssueRecord(
            transactionId = txnId,
            bookId = book.id,
            bookTitle = book.title,
            studentId = cleanStudentId,
            issueDate = getTimestamp(),
            status = IssueStatus.ISSUED
        )
        transactionsList.add(record)

        return Pair(
            true,
            "Success! Book '${book.title}' issued to student '$cleanStudentId'. Txn ID: $txnId. Available remaining: ${book.availableCopies}."
        )
    }

    // ========================================================================
    // TASK 5: Return Books
    // ========================================================================
    fun returnBook(bookId: String, studentId: String): Pair<Boolean, String> {
        val cleanBookId = bookId.trim().uppercase()
        val cleanStudentId = studentId.trim().uppercase()

        if (cleanBookId.isEmpty() || cleanStudentId.isEmpty()) {
            return Pair(false, "Error: Both Book ID and Student ID are required.")
        }

        // Step 1: Verify that student has an outstanding issue record for that particular book
        val matchingIssue = transactionsList.find {
            it.bookId.uppercase() == cleanBookId &&
            it.studentId.uppercase() == cleanStudentId &&
            it.status == IssueStatus.ISSUED
        }

        // Step 2: Reject returns without a matching issue record
        if (matchingIssue == null) {
            return Pair(
                false,
                "Return Rejected: No active borrowing record found for Student '$cleanStudentId' with Book ID '$cleanBookId'."
            )
        }

        // Step 3: Increase available copies by one after valid return
        val book = booksMap[cleanBookId]
        if (book != null && book.availableCopies < book.totalCopies) {
            book.availableCopies += 1
        }

        // Step 4: Update transaction status
        matchingIssue.status = IssueStatus.RETURNED
        matchingIssue.returnDate = getTimestamp()

        return Pair(
            true,
            "Success! Book '${matchingIssue.bookTitle}' returned by '$cleanStudentId'. Txn ${matchingIssue.transactionId} closed. Available copies: ${book?.availableCopies ?: "N/A"}."
        )
    }

    // ========================================================================
    // TASK 6: Display Currently Issued Books
    // ========================================================================
    fun getCurrentlyIssuedBooks(): List<IssueRecord> {
        // Only show books that are currently issued and have not been returned
        return transactionsList.filter { it.status == IssueStatus.ISSUED }
    }

    // ========================================================================
    // DASHBOARD STATISTICS
    // ========================================================================
    fun getDashboardStats(): Map<String, Int> {
        val totalBooks = booksMap.size
        val availableCopies = booksMap.values.sumOf { it.availableCopies }
        val currentlyIssued = getCurrentlyIssuedBooks().size
        val totalRegisteredCopies = booksMap.values.sumOf { it.totalCopies }

        return mapOf(
            "totalBooks" to totalBooks,
            "availableCopies" to availableCopies,
            "currentlyIssued" to currentlyIssued,
            "totalRegisteredCopies" to totalRegisteredCopies
        )
    }
}

// ============================================================================
// TASK 7: MENU-DRIVEN CONSOLE INTERFACE USING KOTLIN 'WHEN' EXPRESSION
// ============================================================================

fun main() {
    val manager = LibraryManager()
    val scanner = Scanner(System.`in`)
    var running = true

    printWelcomeHeader()

    while (running) {
        displayMenuOptions()
        print("Enter your choice (0-8): ")
        val input = scanner.nextLine().trim()

        // Menu driven using Kotlin's idiomatic `when` expression
        when (input) {
            "1" -> handleDashboard(manager)
            "2" -> handleAddBook(manager, scanner)
            "3" -> handleDisplayAllBooks(manager)
            "4" -> handleSearchBooks(manager, scanner)
            "5" -> handleIssueBook(manager, scanner)
            "6" -> handleReturnBook(manager, scanner)
            "7" -> handleDisplayIssuedBooks(manager)
            "8" -> handleResetSampleData(manager)
            "9" -> handlePolicyAndWarnings()
            "0" -> {
                println("\nThank you for using the Library Management System. Goodbye!")
                running = false
            }
            else -> {
                println("\n>>> Invalid choice '$input'. Please select a valid option from 0 to 9.\n")
            }
        }
    }
}

// ============================================================================
// CONSOLE INTERACTION HANDLERS
// ============================================================================

fun printWelcomeHeader() {
    println("============================================================================")
    println("           LIBRARY PRO MANAGEMENT SYSTEM (KOTLIN CORE ENGINE)               ")
    println("              College IT Workshop Demonstration Architecture               ")
    println("============================================================================")
}

fun displayMenuOptions() {
    println("\n----------------------------- MAIN MENU ------------------------------------")
    println(" [1] Dashboard Overview (Statistics & Summary)")
    println(" [2] Add New Book (Task 1)")
    println(" [3] Display All Books (Task 2)")
    println(" [4] Search Books by ID or Title (Task 3)")
    println(" [5] Issue Book to Student (Task 4)")
    println(" [6] Return Book from Student (Task 5)")
    println(" [7] Display Currently Issued Books (Task 6)")
    println(" [8] Reset to Default Sample Data")
    println(" [9] View Instructions, Guidelines & Warnings (Overdue/Lost Policy)")
    println(" [0] Exit Application")
    println("----------------------------------------------------------------------------")
}

fun handleDashboard(manager: LibraryManager) {
    val stats = manager.getDashboardStats()
    println("\n=========================== DASHBOARD OVERVIEW ===========================")
    println(String.format(" %-30s : %d distinct titles", "Total Registered Books", stats["totalBooks"]))
    println(String.format(" %-30s : %d copies on shelf", "Available Copies", stats["availableCopies"]))
    println(String.format(" %-30s : %d copies on loan", "Currently Issued Books", stats["currentlyIssued"]))
    println(String.format(" %-30s : %d total physical units", "Total Registered Copies", stats["totalRegisteredCopies"]))
    println("==========================================================================")
}

fun handleAddBook(manager: LibraryManager, scanner: Scanner) {
    println("\n--- [Task 1] ADD NEW BOOK ---")
    print("Enter Book ID (e.g. BK-201): ")
    val id = scanner.nextLine()

    print("Enter Book Title: ")
    val title = scanner.nextLine()

    print("Enter Author Name: ")
    val author = scanner.nextLine()

    print("Enter Publication Year: ")
    val yearStr = scanner.nextLine().trim()
    val year = yearStr.toIntOrNull()
    if (year == null) {
        println(">>> Error: Invalid publication year '$yearStr'. Operation aborted.")
        return
    }

    print("Enter Number of Copies: ")
    val copiesStr = scanner.nextLine().trim()
    val copies = copiesStr.toIntOrNull()
    if (copies == null) {
        println(">>> Error: Invalid copies count '$copiesStr'. Operation aborted.")
        return
    }

    val (success, message) = manager.addBook(id, title, author, year, copies)
    if (success) {
        println("\n>>> SUCCESS: $message")
    } else {
        println("\n>>> ERROR: $message")
    }
}

fun handleDisplayAllBooks(manager: LibraryManager) {
    println("\n--- [Task 2] DISPLAY ALL REGISTERED BOOKS ---")
    val allBooks = manager.getAllBooks()

    if (allBooks.isEmpty()) {
        println("No books are currently registered in the catalog.")
        return
    }

    val format = "%-10s | %-40s | %-28s | %-6s | %-12s | %-12s"
    println("-".repeat(118))
    println(String.format(format, "Book ID", "Title", "Author", "Year", "Available", "Status"))
    println("-".repeat(118))

    for (book in allBooks) {
        val truncatedTitle = if (book.title.length > 38) book.title.take(35) + "..." else book.title
        val truncatedAuthor = if (book.author.length > 26) book.author.take(23) + "..." else book.author
        val stockStr = "${book.availableCopies} / ${book.totalCopies}"

        println(
            String.format(
                format,
                book.id,
                truncatedTitle,
                truncatedAuthor,
                book.year.toString(),
                stockStr,
                book.statusDescription
            )
        )
    }
    println("-".repeat(118))
    println("Total registered titles: ${allBooks.size}")
}

fun handleSearchBooks(manager: LibraryManager, scanner: Scanner) {
    println("\n--- [Task 3] SEARCH BOOKS ---")
    print("Enter Book ID or Title keyword to search: ")
    val query = scanner.nextLine()

    val results = manager.searchBooks(query)
    if (results.isEmpty()) {
        println(">>> No matching books found for search query: '$query'")
        return
    }

    println("\nFound ${results.size} matching book(s):")
    for (book in results) {
        println("-".repeat(70))
        println("  Book ID          : ${book.id}")
        println("  Title            : ${book.title}")
        println("  Author           : ${book.author}")
        println("  Publication Year : ${book.year}")
        println("  Available Copies : ${book.availableCopies} of ${book.totalCopies} (${book.statusDescription})")

        val activeBorrowers = manager.getActiveBorrowers(book.id)
        if (activeBorrowers.isNotEmpty()) {
            println("  Currently Loaned : ${activeBorrowers.size} copy(s)")
            activeBorrowers.forEach { txn ->
                println("    * Student ID: ${txn.studentId} | Issued on: ${txn.issueDate}")
            }
        }
    }
    println("-".repeat(70))
}

fun handleIssueBook(manager: LibraryManager, scanner: Scanner) {
    println("\n--- [Task 4] ISSUE BOOK ---")
    print("Enter Book ID to issue (e.g. BK-101): ")
    val bookId = scanner.nextLine()

    print("Enter Student ID (e.g. STU-2024-001): ")
    val studentId = scanner.nextLine()

    val (success, message) = manager.issueBook(bookId, studentId)
    if (success) {
        println("\n>>> SUCCESS: $message")
    } else {
        println("\n>>> REJECTED: $message")
    }
}

fun handleReturnBook(manager: LibraryManager, scanner: Scanner) {
    println("\n--- [Task 5] RETURN BOOK ---")
    print("Enter Book ID being returned (e.g. BK-101): ")
    val bookId = scanner.nextLine()

    print("Enter Student ID returning the book: ")
    val studentId = scanner.nextLine()

    val (success, message) = manager.returnBook(bookId, studentId)
    if (success) {
        println("\n>>> SUCCESS: $message")
    } else {
        println("\n>>> REJECTED: $message")
    }
}

fun handleDisplayIssuedBooks(manager: LibraryManager) {
    println("\n--- [Task 6] CURRENTLY ISSUED BOOKS ---")
    val issued = manager.getCurrentlyIssuedBooks()

    if (issued.isEmpty()) {
        println("All library books are accounted for. No books are currently on loan.")
        return
    }

    val format = "%-10s | %-10s | %-40s | %-16s | %-16s | %-10s"
    println("-".repeat(115))
    println(String.format(format, "Txn ID", "Book ID", "Title", "Student ID", "Issue Date", "Status"))
    println("-".repeat(115))

    for (rec in issued) {
        val truncatedTitle = if (rec.bookTitle.length > 38) rec.bookTitle.take(35) + "..." else rec.bookTitle
        println(
            String.format(
                format,
                rec.transactionId,
                rec.bookId,
                truncatedTitle,
                rec.studentId,
                rec.issueDate,
                rec.status.name
            )
        )
    }
    println("-".repeat(115))
    println("Total books currently on loan: ${issued.size}")
}

fun handleResetSampleData(manager: LibraryManager) {
    manager.loadSampleData()
    println("\n>>> System catalog and circulation history reset to default demo data.")
}

fun handlePolicyAndWarnings() {
    println("\n============================================================================")
    println("          LIBRARY POLICY, GUIDELINES & WARNING NOTICES (2026-27)            ")
    println("============================================================================")
    println("\n[1] OPERATIONAL INSTRUCTIONS:")
    println("  - Issue Procedure: Provide Book ID & Student ID; loan period is 14 calendar days.")
    println("  - Return Procedure: Present book at counter; system closes loan and restocks copy.")
    println("  - Renewals: 1 renewal allowed for 7 additional days if no reservation exists.")
    println("\n[2] CIRCULATION GUIDELINES:")
    println("  - Quota: Undergraduates may borrow max 3 books; Postgraduates max 5 books.")
    println("  - Care of Books: Zero tolerance for writing, page-folding, or water damage.")
    println("  - Library Cards: Strictly non-transferable institutional credentials.")
    println("\n[3] WARNINGS: DELAYED RETURNS & OVERDUE FINES:")
    println("  - Grace Period: 1 calendar day.")
    println("  - Daily Overdue Fine: Rs. 10.00 / $1.00 per day per book.")
    println("  - Extended Overdue (> 14 days): Escalates to Rs. 25.00 / $2.50 per day.")
    println("  - Account Lock: Automatic borrowing privilege suspension until dues cleared.")
    println("\n[4] WARNINGS: LOST OR DAMAGED BOOKS:")
    println("  - Report Lost Books immediately to freeze daily overdue fines.")
    println("  - Replacement: Supply exact same brand new copy (ISBN & Edition) + processing fee,")
    println("    OR pay 150% of the current market retail price.")
    println("  - Clearance Hold: Unsettled lost books block semester exam admit cards and degree clearance.")
    println("============================================================================\n")
}

