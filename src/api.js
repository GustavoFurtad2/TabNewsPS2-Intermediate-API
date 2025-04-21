export default async function(req: Request): Promise<Response> {
  
    const url = new URL(req.url);
  
    if (url.pathname.startsWith("/content/")) {
      
        const page = url.searchParams.get("page") || "1";
        const perPage = url.searchParams.get("per_page") || "10";
        const strategy = url.searchParams.get("strategy") || "default";
        const slug = url.searchParams.get("slug");
  
        try {
  
            const urlToFetch = slug
                ? `https://www.tabnews.com.br/api/v1/contents/${slug}?page=${page}&per_page=${perPage}&strategy=${strategy}`
                : `https://www.tabnews.com.br/api/v1/contents?page=${page}&per_page=${perPage}&strategy=${strategy}`;
  
            const response = await fetch(urlToFetch);
  
            if (!response.ok) {
                throw new Error("Falha ao buscar dados da API externa");
            }
  
            const data = await response.json();
  
            const result = data.map((post: any) => ({
                title: post.title,
                owner_username: post.owner_username,
                tabcoins: post.tabcoins,
                slug: post.slug,
            }));
  
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: {"Content-Type": "application/json"},
            });
        
        } catch (error) {
  
            return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {"Content-Type": "application/json"},
            });
        }
    }
  
    if (url.pathname.startsWith("/post/")) {
      
        const owner = url.searchParams.get("owner");
        const slug = url.searchParams.get("slug");
  
        if (!owner || !slug) {
            return new Response(JSON.stringify({ error: "Owner and slug are required" }), {
                status: 400,
                headers: {"Content-Type": "application/json"},
            });
        }
  
        try {
  
            const response = await fetch(`https://www.tabnews.com.br/api/v1/contents/${owner}/${slug}`);
  
            if (!response.ok) {
                throw new Error("Falha ao buscar dados da API externa");
            }
  
            const data = await response.json();
  
            if (!data || !data.body) {
                return new Response(JSON.stringify({ error: "Post not found" }), {
                    status: 404,
                    headers: {"Content-Type": "application/json"},
                });
            }
  
            const result = {
                body: data.body
            };
  
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: {"Content-Type": "application/json"},
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
  
    return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
    });
}