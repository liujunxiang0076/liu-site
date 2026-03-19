<template>
  <div class="archives s-card">
    <div class="title">
      <span class="eyebrow">内容归档</span>
      <div class="heading">
        <h1 class="name">文章文库</h1>
        <sup v-if="theme.postData?.length" class="num">{{ theme.postData.length }}</sup>
      </div>
      <p class="summary">按年份整理所有文章，保留更安静的浏览节奏，方便快速检索历史内容。</p>
    </div>
    <div class="archives-list">
      <div v-for="(year, index) in theme.archivesData.year" :key="index" class="year-list">
        <div class="year-head">
          <span class="year">{{ year }}</span>
          <span class="year-count">{{ theme.archivesData.data[year].articles.length }} 篇</span>
        </div>
        <div class="posts">
          <div
            v-for="(post, postIndex) in theme.archivesData.data[year].articles"
            :key="postIndex"
            class="posts-item s-card hover"
            @click="router.go(post.regularPath)"
          >
            <div class="post-main">
              <span class="post-date">{{ formatArchiveDate(post.date) }}</span>
              <span class="title">{{ post.title }}</span>
            </div>
            <div class="tags">
              <a
                v-for="(tags, tagsIndex) in post.tags"
                :key="tagsIndex"
                :href="`/src/pages/tags/${tags}`"
                class="type-item"
              >
                <i class="iconfont icon-hashtag" />
                <span class="name">{{ tags }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { theme } = useData();
const router = useRouter();

const formatArchiveDate = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};
</script>

<style lang="scss" scoped>
.archives {
  width: min(100%, 860px);
  margin: 0 auto;
  padding: 1.5rem 1.5rem 1.75rem;
  .title {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
    .eyebrow {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--main-color);
      margin-bottom: 0.45rem;
    }
    .heading {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      .name {
        margin: 0;
        border-bottom: none;
        font-size: 1.9rem;
        line-height: 1.18;
      }
      .num {
        font-size: 1rem;
        font-weight: 700;
        opacity: 0.52;
      }
    }
    .summary {
      margin: 0.65rem 0 0;
      font-size: 0.95rem;
      line-height: 1.7;
      opacity: 0.62;
    }
  }
  .archives-list {
    .year-list {
      margin-bottom: 1.75rem;
      .year-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.55rem;
        border-bottom: 1px solid var(--main-card-border);
        .year {
          position: relative;
          display: flex;
          align-items: center;
          padding-left: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          &::before {
            content: "";
            position: absolute;
            left: 0;
            width: 4px;
            height: 70%;
            background-color: var(--main-color);
            border-radius: 8px;
          }
        }
        .year-count {
          font-size: 0.8rem;
          color: var(--main-font-second-color);
        }
      }
      .posts {
        display: grid;
        gap: 0.85rem;
        .posts-item {
          padding: 1rem 1rem 0.95rem;
          margin-bottom: 0;
          .post-main {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
          }
          .post-date {
            font-size: 0.75rem;
            letter-spacing: 0.08em;
            color: var(--main-font-second-color);
          }
          .title {
            font-size: 1.02rem;
            font-weight: 700;
            line-height: 1.45;
            transition: color 0.3s;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            border-top: 1px solid var(--main-card-border);
            opacity: 0.72;
            .type-item {
              font-size: 0.76rem;
              display: flex;
              align-items: center;
              margin-right: 10px;
              margin-bottom: 4px;
              .name {
                transition: color 0.3s;
              }
              .iconfont {
                margin-right: 2px;
                transition: color 0.3s;
              }
              &:hover {
                .name,
                .iconfont {
                  color: var(--main-color);
                }
              }
            }
          }
          &:hover {
            .title {
              color: var(--main-color);
            }
          }
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 0.95rem 1.2rem;

    .title {
      margin-bottom: 1.1rem;
      .heading {
        .name {
          font-size: 1.55rem;
        }
      }
      .summary {
        font-size: 0.88rem;
      }
    }

    .archives-list {
      .year-list {
        margin-bottom: 1.35rem;

        .year-head {
          margin-bottom: 0.8rem;

          .year {
            font-size: 1rem;
          }

          .year-count {
            font-size: 0.75rem;
          }
        }

        .posts {
          gap: 0.7rem;

          .posts-item {
            padding: 0.9rem;

            .title {
              font-size: 0.96rem;
            }

            .tags {
              margin-top: 0.7rem;
              padding-top: 0.7rem;
            }
          }
        }
      }
    }
  }
}
</style>
