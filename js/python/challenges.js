/**
 * Idiomatic Python starters, reference solutions, and playground snippets
 * paired with existing Coding Lab challenges and algorithm lessons.
 */

export const PYTHON_CHALLENGES = {
    'bubble-sort': {
        fnName: 'bubble_sort',
        starter: `def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        # TODO: duyệt j từ 0 đến n - 2 - i, đổi chỗ nếu a[j] > a[j + 1]
        
        if not swapped:
            break
    return a`,
        solution: `def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a`
    },
    'selection-sort': {
        fnName: 'selection_sort',
        starter: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        min_idx = i
        # TODO: tìm min_idx trong [i + 1 .. n - 1] và đổi chỗ với a[i]
        
    return a`,
        solution: `def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        a[i], a[min_idx] = a[min_idx], a[i]
    return a`
    },
    'insertion-sort': {
        fnName: 'insertion_sort',
        starter: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        # TODO: dịch các phần tử > key sang phải và đặt key vào j + 1
        
    return a`,
        solution: `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`
    },
    'quick-sort': {
        fnName: 'sort_array',
        starter: `def quick_sort(a, low, high):
    if low >= high:
        return
    pivot = a[high]
    i = low - 1
    # TODO: phân hoạch các phần tử <= pivot về bên trái, đặt pivot vào i + 1, rồi gọi đệ quy
    

def sort_array(a):
    quick_sort(a, 0, len(a) - 1)
    return a`,
        solution: `def quick_sort(a, low, high):
    if low >= high:
        return
    pivot = a[high]
    i = low - 1
    for j in range(low, high):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[high] = a[high], a[i + 1]
    quick_sort(a, low, i)
    quick_sort(a, i + 2, high)

def sort_array(a):
    quick_sort(a, 0, len(a) - 1)
    return a`
    },
    'merge-sort': {
        fnName: 'sort_array',
        starter: `def merge(a, l, m, r):
    left = a[l:m + 1]
    right = a[m + 1:r + 1]
    # TODO: trộn left và right lại vào a[l..r]
    

def merge_sort(a, l, r):
    if l >= r:
        return
    m = (l + r) // 2
    merge_sort(a, l, m)
    merge_sort(a, m + 1, r)
    merge(a, l, m, r)

def sort_array(a):
    if len(a) > 0:
        merge_sort(a, 0, len(a) - 1)
    return a`,
        solution: `def merge(a, l, m, r):
    left = a[l:m + 1]
    right = a[m + 1:r + 1]
    i = j = 0
    k = l
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            a[k] = left[i]
            i += 1
        else:
            a[k] = right[j]
            j += 1
        k += 1
    while i < len(left):
        a[k] = left[i]
        i += 1
        k += 1
    while j < len(right):
        a[k] = right[j]
        j += 1
        k += 1

def merge_sort(a, l, r):
    if l >= r:
        return
    m = (l + r) // 2
    merge_sort(a, l, m)
    merge_sort(a, m + 1, r)
    merge(a, l, m, r)

def sort_array(a):
    if len(a) > 0:
        merge_sort(a, 0, len(a) - 1)
    return a`
    },
    'binary-search': {
        fnName: 'binary_search',
        starter: `def binary_search(a, target):
    low, high = 0, len(a) - 1
    while low <= high:
        mid = (low + high) // 2
        # TODO: kiểm tra a[mid] với target và thu hẹp [low..high]
        
    return -1`,
        solution: `def binary_search(a, target):
    low, high = 0, len(a) - 1
    while low <= high:
        mid = (low + high) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`
    },
    'sequential-search': {
        fnName: 'linear_search',
        starter: `def linear_search(a, target):
    # TODO: duyệt từ đầu mảng và trả về chỉ số đầu tiên bằng target
    
    return -1`,
        solution: `def linear_search(a, target):
    for i, val in enumerate(a):
        if val == target:
            return i
    return -1`
    },
    'ex-count-pairs': {
        fnName: 'count_pairs',
        starter: `def count_pairs(a, k):
    a.sort()
    left, right = 0, len(a) - 1
    count = 0
    # TODO: dùng hai con trỏ để đếm số cặp có tổng bằng k
    
    return count`,
        solution: `def count_pairs(a, k):
    a.sort()
    left, right = 0, len(a) - 1
    count = 0
    while left < right:
        s = a[left] + a[right]
        if s == k:
            count += 1
            left += 1
            right -= 1
        elif s < k:
            left += 1
        else:
            right -= 1
    return count`
    },
    'bracket-matching': {
        fnName: 'is_valid_brackets',
        starter: `def is_valid_brackets(s):
    stack = []
    # TODO: gặp ngoặc mở thì push; gặp ngoặc đóng thì pop và kiểm tra khớp
    
    return len(stack) == 0`,
        solution: `def is_valid_brackets(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack.pop() != pairs.get(ch):
                return False
    return len(stack) == 0`
    },
    'postfix-eval': {
        fnName: 'eval_postfix',
        starter: `def eval_postfix(tokens):
    stack = []
    # TODO: nếu là toán tử thì pop b rồi pop a, tính a op b rồi push lại; ngược lại push số
    
    return stack.pop()`,
        solution: `def eval_postfix(tokens):
    stack = []
    for t in tokens:
        if t in ('+', '-', '*', '/'):
            b = stack.pop()
            a = stack.pop()
            if t == '+':
                stack.append(a + b)
            elif t == '-':
                stack.append(a - b)
            elif t == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack.pop()`
    },
    'palindrome-stack-queue': {
        fnName: 'is_palindrome',
        starter: `def is_palindrome(s):
    clean = ''.join(s.lower().split())
    # TODO: kiểm tra đối xứng bằng stack/queue hoặc hai con trỏ
    
    return True`,
        solution: `def is_palindrome(s):
    clean = ''.join(s.lower().split())
    return clean == clean[::-1]`
    },
    'stack-adt': {
        fnName: 'run_stack_ops',
        starter: `def run_stack_ops(ops):
    stack = []
    out = []
    # TODO: xử lý push X, pop, top
    
    return out`,
        solution: `def run_stack_ops(ops):
    stack = []
    out = []
    for op in ops:
        if op.startswith('push '):
            stack.append(int(op[5:]))
        elif op == 'pop':
            if stack:
                out.append(stack.pop())
        elif op == 'top':
            if stack:
                out.append(stack[-1])
    return out`
    },
    'queue-adt': {
        fnName: 'run_queue_ops',
        starter: `from collections import deque

def run_queue_ops(ops):
    q = deque()
    out = []
    # TODO: xử lý enq X và deq
    
    return out`,
        solution: `from collections import deque

def run_queue_ops(ops):
    q = deque()
    out = []
    for op in ops:
        if op.startswith('enq '):
            q.append(int(op[4:]))
        elif op == 'deq' and q:
            out.append(q.popleft())
    return out`
    },
    'circular-array-queue': {
        fnName: 'circular_queue_ops',
        starter: `def circular_queue_ops(cap, ops):
    data = [0] * cap
    front = 0
    size = 0
    out = []
    # TODO: dùng công thức (front + size) % cap và (front + 1) % cap
    
    return out`,
        solution: `def circular_queue_ops(cap, ops):
    data = [0] * cap
    front = 0
    size = 0
    out = []
    for op in ops:
        if op.startswith('enq '):
            if size < cap:
                rear = (front + size) % cap
                data[rear] = int(op[4:])
                size += 1
        elif op == 'deq' and size > 0:
            out.append(data[front])
            front = (front + 1) % cap
            size -= 1
    return out`
    },
    'array-list': {
        fnName: 'insert_at',
        starter: `def insert_at(a, idx, val):
    res = [0] * (len(a) + 1)
    # TODO: chép phần trước idx, đặt val, dịch phần còn lại sang phải
    
    return res`,
        solution: `def insert_at(a, idx, val):
    res = [0] * (len(a) + 1)
    for i in range(idx):
        res[i] = a[i]
    res[idx] = val
    for i in range(idx, len(a)):
        res[i + 1] = a[i]
    return res`
    },
    'recursion': {
        fnName: 'sum_digits',
        starter: `def sum_digits(n):
    # TODO: trường hợp cơ sở khi n < 10, bước đệ quy n % 10 + sum_digits(n // 10)
    
    return 0`,
        solution: `def sum_digits(n):
    if n < 10:
        return n
    return (n % 10) + sum_digits(n // 10)`
    },
    'fibonacci': {
        fnName: 'fib',
        starter: `def fib(n):
    if n <= 1:
        return n
    # TODO: dùng hai biến prev, curr cập nhật từ 2 đến n
    
    return 0`,
        solution: `def fib(n):
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr`
    },
    'string-matching-bf': {
        fnName: 'find_substring',
        starter: `def find_substring(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    # TODO: thử mọi vị trí i từ 0 đến n - m
    
    return -1`,
        solution: `def find_substring(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    for i in range(n - m + 1):
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:
            return i
    return -1`
    },
    'binary-strings': {
        fnName: 'generate_binary_strings',
        starter: `def generate_binary_strings(n):
    res = []
    def backtrack(cur):
        if len(cur) == n:
            res.append(cur)
            return
        # TODO: thử thêm '0' rồi '1'
        
    backtrack('')
    return res`,
        solution: `def generate_binary_strings(n):
    res = []
    def backtrack(cur):
        if len(cur) == n:
            res.append(cur)
            return
        backtrack(cur + '0')
        backtrack(cur + '1')
    backtrack('')
    return res`
    },
    'n-queens': {
        fnName: 'count_n_queens',
        starter: `def count_n_queens(n):
    cols = [False] * n
    diag1 = [False] * (2 * n)
    diag2 = [False] * (2 * n)
    count = 0

    def dfs(row):
        nonlocal count
        if row == n:
            count += 1
            return
        # TODO: thử từng cột c, kiểm tra cols[c], diag1[row - c + n], diag2[row + c]
        

    dfs(0)
    return count`,
        solution: `def count_n_queens(n):
    cols = [False] * n
    diag1 = [False] * (2 * n)
    diag2 = [False] * (2 * n)
    count = 0

    def dfs(row):
        nonlocal count
        if row == n:
            count += 1
            return
        for c in range(n):
            d1, d2 = row - c + n, row + c
            if cols[c] or diag1[d1] or diag2[d2]:
                continue
            cols[c] = diag1[d1] = diag2[d2] = True
            dfs(row + 1)
            cols[c] = diag1[d1] = diag2[d2] = False

    dfs(0)
    return count`
    },
    'coin-change-greedy': {
        fnName: 'greedy_coin_change',
        starter: `def greedy_coin_change(coins, amount):
    coins.sort(reverse=True)
    count = 0
    # TODO: duyệt từ mệnh giá lớn nhất về nhỏ nhất
    
    return count if amount == 0 else -1`,
        solution: `def greedy_coin_change(coins, amount):
    coins.sort(reverse=True)
    count = 0
    for c in coins:
        if c <= 0:
            continue
        take = amount // c
        count += take
        amount -= take * c
    return count if amount == 0 else -1`
    },
    'activity-selection': {
        fnName: 'max_activities',
        starter: `def max_activities(intervals):
    intervals.sort(key=lambda x: x[1])
    count = 0
    last_end = float('-inf')
    # TODO: duyệt từng khoảng đã sắp theo giờ kết thúc
    
    return count`,
        solution: `def max_activities(intervals):
    intervals.sort(key=lambda x: x[1])
    count = 0
    last_end = float('-inf')
    for start, end in intervals:
        if start >= last_end:
            count += 1
            last_end = end
    return count`
    },
    'binomial-dp': {
        fnName: 'binomial_dp',
        starter: `def binomial_dp(n, k):
    if k < 0 or k > n:
        return 0
    dp = [0] * (k + 1)
    dp[0] = 1
    # TODO: cập nhật dp[j] += dp[j - 1] theo thứ tự j giảm dần
    
    return dp[k]`,
        solution: `def binomial_dp(n, k):
    if k < 0 or k > n:
        return 0
    dp = [0] * (k + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for j in range(min(i, k), 0, -1):
            dp[j] += dp[j - 1]
    return dp[k]`
    },
    'lis': {
        fnName: 'length_of_lis',
        starter: `def length_of_lis(a):
    if not a:
        return 0
    L = [1] * len(a)
    # TODO: L[i] = max(L[i], 1 + L[j]) với j < i và a[j] < a[i]
    
    return max(L)`,
        solution: `def length_of_lis(a):
    if not a:
        return 0
    L = [1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[j] < a[i] and L[j] + 1 > L[i]:
                L[i] = L[j] + 1
    return max(L)`
    },
    'knapsack-01': {
        fnName: 'knapsack_01',
        starter: `def knapsack_01(w, v, W):
    dp = [0] * (W + 1)
    # TODO: với mỗi vật i, duyệt sức chứa c từ W giảm về w[i]
    
    return dp[W]`,
        solution: `def knapsack_01(w, v, W):
    dp = [0] * (W + 1)
    for wi, vi in zip(w, v):
        for c in range(W, wi - 1, -1):
            dp[c] = max(dp[c], dp[c - wi] + vi)
    return dp[W]`
    },
    'lcs': {
        fnName: 'lcs_length',
        starter: `def lcs_length(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    # TODO: điền bảng dp[i][j]
    
    return dp[m][n]`,
        solution: `def lcs_length(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`
    },
    'grid-path-dp': {
        fnName: 'count_paths',
        starter: `def count_paths(m, n):
    dp = [[0] * n for _ in range(m)]
    # TODO: hàng 0 và cột 0 bằng 1, các ô khác bằng tổng ô trên và ô trái
    
    return dp[m - 1][n - 1]`,
        solution: `def count_paths(m, n):
    dp = [[0] * n for _ in range(m)]
    for i in range(m):
        dp[i][0] = 1
    for j in range(n):
        dp[0][j] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]`
    },
    'dfs': {
        fnName: 'dfs_order',
        starter: `def dfs_order(adj, start):
    visited = [False] * len(adj)
    order = []

    def dfs(u):
        # TODO: đánh dấu visited[u], ghi vào order, duyệt các đỉnh kề chưa thăm
        pass

    dfs(start)
    return order`,
        solution: `def dfs_order(adj, start):
    visited = [False] * len(adj)
    order = []

    def dfs(u):
        visited[u] = True
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                dfs(v)

    dfs(start)
    return order`
    },
    'bfs': {
        fnName: 'bfs_distances',
        starter: `from collections import deque

def bfs_distances(adj, start):
    dist = [-1] * len(adj)
    dist[start] = 0
    q = deque([start])
    # TODO: lấy u từ q, duyệt các đỉnh kề v chưa thăm và cập nhật dist[v]
    
    return dist`,
        solution: `from collections import deque

def bfs_distances(adj, start):
    dist = [-1] * len(adj)
    dist[start] = 0
    q = deque([start])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`
    },
    'dijkstra': {
        fnName: 'dijkstra',
        starter: `def dijkstra(graph, src):
    n = len(graph)
    dist = [float('inf')] * n
    used = [False] * n
    dist[src] = 0
    # TODO: lặp n lần, chọn đỉnh u chưa dùng có dist[u] nhỏ nhất rồi nới lỏng các cạnh (u, v)
    
    return dist`,
        solution: `def dijkstra(graph, src):
    n = len(graph)
    dist = [float('inf')] * n
    used = [False] * n
    dist[src] = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            if not used[i] and (u == -1 or dist[i] < dist[u]):
                u = i
        if u == -1 or dist[u] == float('inf'):
            break
        used[u] = True
        for v in range(n):
            if graph[u][v] > 0 and dist[u] + graph[u][v] < dist[v]:
                dist[v] = dist[u] + graph[u][v]
    return dist`
    },
    'heap-insert': {
        fnName: 'heap_insert',
        starter: `def heap_insert(heap, val):
    heap.append(val)
    i = len(heap) - 1
    # TODO: khi i > 0 và heap[i] < heap[parent], đổi chỗ với cha (i - 1) // 2
    
    return heap`,
        solution: `def heap_insert(heap, val):
    heap.append(val)
    i = len(heap) - 1
    while i > 0:
        p = (i - 1) // 2
        if heap[i] >= heap[p]:
            break
        heap[i], heap[p] = heap[p], heap[i]
        i = p
    return heap`
    },
    'cb-operators-expressions': {
        fnName: 'sum_digits',
        starter: `def sum_digits(n):
    total = 0
    # TODO: tách chữ số bằng n % 10 và giảm n //= 10
    
    return total`,
        solution: `def sum_digits(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`
    },
    'cb-branching-if-switch': {
        fnName: 'is_leap_year',
        starter: `def is_leap_year(year):
    # TODO: trả về True nếu year là năm nhuận
    return False`,
        solution: `def is_leap_year(year):
    return (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0)`
    },
    'cb-loops-break-continue': {
        fnName: 'gcd',
        starter: `def gcd(a, b):
    # TODO: lặp khi b != 0, cập nhật a, b = b, a % b
    return a`,
        solution: `def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a`
    },
    'cb-array-1d': {
        fnName: 'second_max',
        starter: `def second_max(arr):
    first = float('-inf')
    second = float('-inf')
    # TODO: duyệt mảng tìm giá trị lớn thứ hai
    
    return -1 if second == float('-inf') else second`,
        solution: `def second_max(arr):
    first = float('-inf')
    second = float('-inf')
    for x in arr:
        if x > first:
            second = first
            first = x
        elif second < x < first:
            second = x
    return -1 if second == float('-inf') else second`
    },
    'cb-array-2d': {
        fnName: 'diagonal_sum',
        starter: `def diagonal_sum(mat):
    n = len(mat)
    total = 0
    # TODO: cộng phần tử trên hai đường chéo (không tính trùng ô giữa)
    
    return total`,
        solution: `def diagonal_sum(mat):
    n = len(mat)
    total = 0
    for i in range(n):
        for j in range(n):
            if i == j or i + j == n - 1:
                total += mat[i][j]
    return total`
    },
    'cb-ex-array-sort-search': {
        fnName: 'sort_and_search',
        starter: `def sort_and_search(arr, target):
    arr.sort()
    l, r = 0, len(arr) - 1
    # TODO: tìm kiếm nhị phân trên [l, r]
    
    return -1`,
        solution: `def sort_and_search(arr, target):
    arr.sort()
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`
    },
    'cb-ex-string-vigenere': {
        fnName: 'caesar_shift',
        starter: `def caesar_shift(text, shift):
    res = []
    # TODO: dịch từng ký tự hoa sang phải shift bước (mod 26)
    
    return ''.join(res)`,
        solution: `def caesar_shift(text, shift):
    res = []
    for ch in text:
        res.append(chr(((ord(ch) - 65 + shift) % 26) + 65))
    return ''.join(res)`
    },
    'oop-ex-matrix': {
        fnName: 'transpose_matrix',
        starter: `def transpose_matrix(mat):
    n = len(mat)
    # TODO: trả về ma trận chuyển vị n x n
    return [[0] * n for _ in range(n)]`,
        solution: `def transpose_matrix(mat):
    n = len(mat)
    return [[mat[j][i] for j in range(n)] for i in range(n)]`
    },
    'oop-ex-statistics': {
        fnName: 'variance',
        starter: `def variance(arr):
    # TODO: tính phương sai tổng thể làm tròn 2 chữ số thập phân
    return 0`,
        solution: `def variance(arr):
    mean = sum(arr) / len(arr)
    var = sum((x - mean) ** 2 for x in arr) / len(arr)
    return round(var, 2)`
    },
    'oop-stream-api-basics': {
        fnName: 'even_squares',
        starter: `def even_squares(arr):
    # TODO: lọc số chẵn và bình phương
    return []`,
        solution: `def even_squares(arr):
    return [x * x for x in arr if x % 2 == 0]`
    }
};

export function getPythonPlaygroundStarter(piece) {
    const id = piece?.id || '';
    if (PYTHON_CHALLENGES[id]) {
        return PYTHON_CHALLENGES[id].solution;
    }
    return `# Thử nghiệm Python trực tiếp trong trình duyệt (${piece?.title || 'HUS'})\n# Bạn có thể bấm "Chạy & Theo dõi bước" để xem Call Stack & biến từng dòng.\n\na = [5, 2, 8, 1, 9]\nfor i in range(len(a)):\n    for j in range(len(a) - 1 - i):\n        if a[j] > a[j + 1]:\n            a[j], a[j + 1] = a[j + 1], a[j]\nprint("Kết quả:", a)`;
}
