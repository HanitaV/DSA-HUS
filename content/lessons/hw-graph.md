## Mục tiêu thực hành

Phiếu bài tập tổng hợp cài đặt biểu diễn đồ thị ([[graph-representation]]) và các thuật toán cốt lõi: [[dfs]], [[bfs]], cây khung nhỏ nhất ([[prim]], [[kruskal]]) và đường đi ngắn nhất ([[dijkstra]]).

## Khung code thực hành: Duyệt toàn bộ đồ thị không liên thông

Khi đồ thị có nhiều thành phần liên thông, một lần gọi `dfs(0)` hoặc `bfs(0)` không đi hết mọi đỉnh. Cần bọc thêm vòng lặp qua tất cả các đỉnh `0..n-1`:

```java
static void traverseAll(List<List<Integer>> adj) {
    int n = adj.size();
    boolean[] visited = new boolean[n];
    int components = 0;
    for (int u = 0; u < n; u++) {
        if (!visited[u]) {
            components++;
            bfsFrom(u, adj, visited);
        }
    }
}
```

## Checklist kiểm thử bắt buộc

- **Đồ thị 1 đỉnh & đồ thị rỗng cạnh:** kiểm tra không lỗi chỉ số.
- **Đồ thị không liên thông:** đếm đúng số thành phần liên thông.
- **Đồ thị có chu trình:** đảm bảo `visited[u] = true` được đánh dấu trước khi đẩy hàng đợi / gọi đệ quy để không lặp vô hạn.
- **Đồ thị có hướng vs vô hướng:** với cạnh vô hướng `(u, v)`, nhớ thêm cả `adj[u].add(v)` và `adj[v].add(u)`.

## Tự kiểm tra

1. Nếu đồ thị có 6 đỉnh và gồm 2 thành phần liên thông rời nhau, chạy `bfs(0)` một lần duy nhất sẽ bỏ sót điều gì?

::: Đáp án
Chỉ thăm được các đỉnh thuộc cùng thành phần liên thông chứa đỉnh `0`, bỏ sót hoàn toàn các đỉnh ở thành phần còn lại.
:::
