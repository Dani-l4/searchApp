console.log('==== start main.js ====');

// CONSTANTS
const GAP = 8;
const CARD_WIDTH = 150 + 2 * GAP;
const CARD_HEIGHT = 150 + 2 * GAP;

// APP STATE
const appState = {
    header: {
        pageTitle: 'POSTS PAGE EX_1'
    },
    posts: {
        search: {
            label: 'filter posts by search',
            placeholder: 'type search value',
            searchValue: '',
            selectionPosition: 0,
        },
        isPostsFetching: true,
        value: [],
        filteredValue: [],
        postsOnPage: [],
        cardCountPage: 0,
        navigation: {
            prevPage: {
                value: '<<<',
                disabled: true,
            },
            nextPage: {
                value: '>>>',
                disabled: false,
            },
            pageNumber: 1,
        }
    },
    footer: {
        author: 'made by lavfrim',
    },
    service: {
        baseUrl: 'https://jsonplaceholder.typicode.com/',
        getPost: {
            url: '/posts',
        }
    },
    loading: {
        message: 'Loading...',
    },
    errors: undefined,
};

// COMPONENTS
const components = {
    header: ({ pageTitle }) => `
        <header>
            <h1>${pageTitle}</h1>
        </header>
    `,
    main: ({ postsSection }) => `
        <main>
            ${postsSection}
        </main>
    `,
    postSection: ({ postsFilter, postsContainer, postsNavigation }) => `
        <section id="post-container" class="post-container">
                ${postsFilter}
                ${postsContainer}
                ${postsNavigation}
        </section>
    `,
    postsFilter: ({ searchLabel, searchPlaceholder, searchValue }) => `
        <div class="search-container">
            <label>
                ${searchLabel}
                <input id="search-input" type="text" placeholder="${searchPlaceholder}" value="${searchValue}" />
            </label>
        </div>
    `,
    postsContainer: ({ posts, isPostsFetching }, { createPostCard, loadingPosts }) => `
        <div id="post-cards-container" class="post-cards-container">
            ${isPostsFetching
                    ? loadingPosts()
                    : posts.map((post) => createPostCard(post)).join('\n')}
        </div>
    `,
    postsNavigation: ({ prevPage, pageNumber, nextPage, prevPageDisabled, nextPageDisabled }) => `
        <nav id="post-navigation" class="post-navigation">
            <button id="prev-post-page-button" ${prevPageDisabled ? 'disabled' : ''}>${prevPage}</button>
            <span id="post-page-number">${pageNumber}</span>
            <button id="next-post-page-button" ${nextPageDisabled ? 'disabled' : ''}>${nextPage}</button>
        </nav>
    `,
    postCard: ({ id, title, description }) => `
        <div id="card-${id}" class="card">
            <p>#${id}</p>
            <p class="card-title">${title}</p>
            <p class="card-description">${description}</p>
        </div>
    `,
    footer: ({ author }) => `
        <footer>
            <h5>${author}</h5>
        </footer>
    `,
    loadingPosts: () => {
        const errorMassage = `
            ${appState.errors}
            <span>Please reload the page!</span>
        `;

        return `
            <div class="loading-posts-container">
                ${appState.errors
            ? errorMassage
            : appState.loading.message}
            </div>
        `;
    },
};

// HTML ELEMENTS
const elements = {
    prevPostPageButton: null,
    nextPostPageButton: null,
    searchInput: null,
}

const getPrevPostPageButton =  () => document.getElementById('prev-post-page-button');
const getNextPostPageButton =  () => document.getElementById('next-post-page-button');
const getSearchInput =  () => document.getElementById('search-input');

const getElements = () => {
    elements.prevPostPageButton = getPrevPostPageButton();
    elements.nextPostPageButton = getNextPostPageButton();
    elements.searchInput = getSearchInput();
}

// UTILS
const mapPosts = (posts) => posts.map((post) => ({ ...post, description: post.body }));
const getCardsCountOnPage = () => {
    const postCardContainerElement = document.getElementById('post-cards-container');
    const { width, height } = postCardContainerElement.getBoundingClientRect();
    const widthCount = Math.floor((width - 3 * GAP) / (CARD_WIDTH + GAP));
    const heightCount = Math.floor((height - 3 * GAP) / (CARD_HEIGHT + GAP));
    appState.posts.cardCountPage = widthCount * heightCount;
};
const getFilteredPosts = () => {
    appState.posts.filteredValue = appState.posts.value.filter((post) =>
        post.title.includes(appState.posts.search.searchValue) ||
        post.body.includes(appState.posts.search.searchValue));
}
const getPostCardsOnPage = () => {
    const minPageNumber = 1;
    const maxPageNUmber = Math.ceil(appState.posts.filteredValue.length / appState.posts.cardCountPage) || 1;
    appState.posts.navigation.pageNumber = appState.posts.navigation.pageNumber > maxPageNUmber
        ? maxPageNUmber
        : appState.posts.navigation.pageNumber;
    appState.posts.navigation.prevPage.disabled = appState.posts.navigation.pageNumber === minPageNumber;
    appState.posts.navigation.nextPage.disabled = appState.posts.navigation.pageNumber === maxPageNUmber;
    const startIndex = appState.posts.cardCountPage * (appState.posts.navigation.pageNumber - 1);
    const endIndex = startIndex + appState.posts.cardCountPage;
    appState.posts.postsOnPage = appState.posts.filteredValue.slice(startIndex, endIndex);
};
const restoreFocusOnSearchInput = () => {
    elements.searchInput.focus();
    elements.searchInput.selectionStart = appState.posts.search.selectionPosition;
};

// RENDER
const render = () => {
    const root = document.getElementById('root-container');
    root.innerHTML = `
    ${components.header({ pageTitle: appState.header.pageTitle })}
    
    ${components.main({
        postsSection: components.postSection({
            postsFilter: components.postsFilter({
                searchLabel: appState.posts.search.label,
                searchPlaceholder: appState.posts.search.placeholder,
                searchValue: appState.posts.search.searchValue,
            }),
            postsContainer: components.postsContainer(
                {
                    posts: mapPosts(appState.posts.postsOnPage),
                    isPostsFetching: appState.posts.isPostsFetching,
                },
                {
                    createPostCard: components.postCard,
                    loadingPosts: components.loadingPosts,
                }
            ),
            postsNavigation: components.postsNavigation({
                prevPage: appState.posts.navigation.prevPage.value,
                pageNumber: appState.posts.navigation.pageNumber,
                nextPage: appState.posts.navigation.nextPage.value,
                prevPageDisabled: appState.posts.navigation.prevPage.disabled,
                nextPageDisabled: appState.posts.navigation.nextPage.disabled,
            })
        })
    })}
    
    ${components.footer({ author: appState.footer.author })}
`;
};

// ADD EVENT LISTENERS ON ACTIONS ELEMENTS
const handleClickPrevPostPageButton = () => {
    appState.posts.navigation.pageNumber -= 1;

    remountApp();
};
const handleClickNextPostPageButton = () => {
    appState.posts.navigation.pageNumber += 1;

    remountApp();
};
const handleSearchInput = (event) => {
    const { value } = event.target;
    appState.posts.search.searchValue = value;
    appState.posts.search.selectionPosition = event.target.selectionStart;

    if (value.length < 3 && value) return;

    remountApp();
}

const removeEventsListeners = () => {
    elements.prevPostPageButton?.removeEventListener('click', handleClickPrevPostPageButton);
    elements.nextPostPageButton?.removeEventListener('click', handleClickNextPostPageButton);
    elements.searchInput?.removeEventListener('input', handleSearchInput);
};

const addEventsListeners = () => {
    elements.prevPostPageButton?.addEventListener('click', handleClickPrevPostPageButton);
    elements.nextPostPageButton?.addEventListener('click', handleClickNextPostPageButton);
    elements.searchInput?.addEventListener('input', handleSearchInput);
};

// ACTUALIZATION APP STATE
const actualizationAppState = () => {
    getFilteredPosts();
    getPostCardsOnPage();
};


// SERVICE
const fetchPosts = async ({ baseUrl, restUrl }) => {
    const response = await fetch(baseUrl + restUrl);
    return await response.json();
};

// APP WORK
const remountApp = () => {
    actualizationAppState();

    removeEventsListeners();
    render();
    getElements();
    addEventsListeners();

    restoreFocusOnSearchInput();
};

(async () => {
    remountApp();

    getCardsCountOnPage();

    try  {
        appState.posts.isPostsFetching = true;

        const posts = await fetchPosts({
            baseUrl: appState.service.baseUrl,
            restUrl: appState.service.getPost.url
        });
        appState.posts.value = posts;
        appState.posts.isPostsFetching = false;

        remountApp();
    } catch (error) {
        appState.errors = error;

        remountApp();
    }
})()

// EVENT LISTENERS
const timeoutIds = [];
window.addEventListener('resize', () => {
    const id = setTimeout(() => {
        while (timeoutIds.length) {
            clearTimeout(timeoutIds.pop());
        }

        getCardsCountOnPage();
        getPostCardsOnPage();

        remountApp();
    }, 500);
    timeoutIds.push(id);
});
